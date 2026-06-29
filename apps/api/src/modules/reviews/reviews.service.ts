import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    // Check product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Prevent duplicate review
    const existing = await this.prisma.review.findFirst({
      where: { userId, productId: dto.productId },
    });
    if (existing) throw new BadRequestException('You have already reviewed this product');

    // Check verified purchase
    const purchaseExists = await this.prisma.orderItem.findFirst({
      where: {
        productId: dto.productId,
        order: { userId, status: { in: ['DELIVERED'] } },
      },
    });

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
        title: dto.title,
        verifiedPurchase: !!purchaseExists,
        status: ReviewStatus.PENDING,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });

    await this.invalidateProductReviewCache(dto.productId);
    return review;
  }

  async getProductReviews(
    productId: string,
    page = 1,
    limit = 10,
    sort: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest',
  ) {
    const cacheKey = `reviews:product:${productId}:${page}:${limit}:${sort}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const orderBy = {
      newest: { createdAt: 'desc' as const },
      oldest: { createdAt: 'asc' as const },
      highest: { rating: 'desc' as const },
      lowest: { rating: 'asc' as const },
      helpful: { helpfulCount: 'desc' as const },
    }[sort];

    const [reviews, total, stats] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, status: ReviewStatus.APPROVED },
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      }),
      this.prisma.review.count({ where: { productId, status: ReviewStatus.APPROVED } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId, status: ReviewStatus.APPROVED },
        _count: { rating: true },
      }),
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.forEach((s) => { ratingDistribution[s.rating] = s._count.rating; });

    const result = {
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      ratingDistribution,
    };

    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async voteHelpful(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    const voteKey = `review:vote:${reviewId}:${userId}`;
    const alreadyVoted = await this.redis.exists(voteKey);
    if (alreadyVoted) throw new BadRequestException('You have already voted on this review');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });

    await this.redis.set(voteKey, '1', 86400 * 30); // 30 days
    return updated;
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { ...dto, status: ReviewStatus.PENDING },
    });

    await this.invalidateProductReviewCache(review.productId);
    return updated;
  }

  async deleteReview(userId: string, reviewId: string, isAdmin = false) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (!isAdmin && review.userId !== userId) throw new ForbiddenException();

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.invalidateProductReviewCache(review.productId);
  }

  async moderateReview(reviewId: string, dto: ModerateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { status: dto.status, adminReply: dto.adminReply },
    });

    await this.invalidateProductReviewCache(review.productId);
    return updated;
  }

  async getPendingReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { status: ReviewStatus.PENDING },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          product: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private async invalidateProductReviewCache(productId: string) {
    await this.redis.delPattern(`reviews:product:${productId}:*`);
    await this.updateProductRating(productId);
  }

  private async updateProductRating(productId: string) {
    const result = await this.prisma.review.aggregate({
      where: { productId, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: result._avg.rating ?? 0,
        reviewCount: result._count.rating,
      },
    });
  }
}
