import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchQueryDto, SearchType } from './dto/search-query.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async search(dto: SearchQueryDto) {
    const { q, type = SearchType.ALL, page = 1, limit = 10 } = dto;
    const term = q.trim();
    if (!term) return { products: [], categories: [], brands: [], blog: [] };

    const cacheKey = `search:${type}:${term}:${page}:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const result: Record<string, unknown> = {};
    const skip = (page - 1) * limit;

    const searchCondition = {
      contains: term,
      mode: 'insensitive' as const,
    };

    if (type === SearchType.ALL || type === SearchType.PRODUCTS) {
      const [products, productsTotal] = await Promise.all([
        this.prisma.product.findMany({
          where: {
            isActive: true,
            OR: [
              { name: searchCondition },
              { description: searchCondition },
              { sku: searchCondition },
              { brand: { name: searchCondition } },
              { category: { name: searchCondition } },
              { tags: { has: term } },
            ],
          },
          skip: type === SearchType.ALL ? 0 : skip,
          take: type === SearchType.ALL ? 6 : limit,
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            images: true, rating: true, reviewCount: true, stock: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
          },
          orderBy: { reviewCount: 'desc' },
        }),
        type !== SearchType.ALL
          ? this.prisma.product.count({
              where: {
                isActive: true,
                OR: [
                  { name: searchCondition },
                  { description: searchCondition },
                  { sku: searchCondition },
                ],
              },
            })
          : Promise.resolve(0),
      ]);
      result.products = products;
      if (type === SearchType.PRODUCTS) {
        result.productsPagination = { page, limit, total: productsTotal, totalPages: Math.ceil(productsTotal / limit) };
      }
    }

    if (type === SearchType.ALL || type === SearchType.CATEGORIES) {
      result.categories = await this.prisma.category.findMany({
        where: { isActive: true, name: searchCondition },
        take: type === SearchType.ALL ? 4 : limit,
        select: { id: true, name: true, slug: true, image: true, _count: { select: { products: true } } },
      });
    }

    if (type === SearchType.ALL || type === SearchType.BRANDS) {
      result.brands = await this.prisma.brand.findMany({
        where: { isActive: true, OR: [{ name: searchCondition }, { description: searchCondition }] },
        take: type === SearchType.ALL ? 4 : limit,
        select: { id: true, name: true, slug: true, logo: true, _count: { select: { products: true } } },
      });
    }

    if (type === SearchType.ALL || type === SearchType.BLOG) {
      result.blog = await this.prisma.post.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [{ title: searchCondition }, { excerpt: searchCondition }, { content: searchCondition }],
        },
        take: type === SearchType.ALL ? 3 : limit,
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true,
          author: { select: { firstName: true, lastName: true } },
        },
      });
    }

    await this.redis.set(cacheKey, result, 60);
    await this.logSearchTerm(term);
    return result;
  }

  async getSuggestions(q: string) {
    if (!q || q.length < 2) return [];
    const term = q.trim();
    const cacheKey = `search:suggest:${term}`;
    const cached = await this.redis.get<string[]>(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isActive: true, name: { contains: term, mode: 'insensitive' } },
      take: 8,
      select: { id: true, name: true, slug: true, images: true },
      orderBy: { reviewCount: 'desc' },
    });

    await this.redis.set(cacheKey, products, 120);
    return products;
  }

  async getPopularSearches() {
    const cacheKey = 'search:popular';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const popular = await this.prisma.searchLog.groupBy({
      by: ['term'],
      _count: { term: true },
      orderBy: { _count: { term: 'desc' } },
      take: 10,
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const result = popular.map((p) => ({ term: p.term, count: p._count.term }));
    await this.redis.set(cacheKey, result, 3600);
    return result;
  }

  private async logSearchTerm(term: string) {
    try {
      await this.prisma.searchLog.create({ data: { term } });
    } catch {
      // Non-critical — ignore failures
    }
  }
}
