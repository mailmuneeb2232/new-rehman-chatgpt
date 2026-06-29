import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatus } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async createPost(authorId: string, dto: CreatePostDto) {
    const slug = await this.generateSlug(dto.slug ?? dto.title);
    const post = await this.prisma.post.create({
      data: {
        ...dto,
        slug,
        authorId,
        publishedAt: dto.status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });
    await this.redis.delPattern('blog:*');
    return post;
  }

  async getPosts(page = 1, limit = 10, tag?: string, status?: PostStatus) {
    const cacheKey = `blog:list:${page}:${limit}:${tag ?? 'all'}:${status ?? 'published'}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const skip = (page - 1) * limit;
    const where = {
      ...(status ? { status } : { status: PostStatus.PUBLISHED }),
      ...(tag ? { tags: { has: tag } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true, coverImage: true,
          publishedAt: true, tags: true, status: true,
          author: { select: { firstName: true, lastName: true, avatar: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const result = { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async getPost(slug: string, isAdmin = false) {
    const cacheKey = `blog:post:${slug}`;
    if (!isAdmin) {
      const cached = await this.redis.get(cacheKey);
      if (cached) return cached;
    }

    const post = await this.prisma.post.findFirst({
      where: { slug, ...(isAdmin ? {} : { status: PostStatus.PUBLISHED }) },
      include: { author: { select: { firstName: true, lastName: true, avatar: true } } },
    });

    if (!post) throw new NotFoundException('Post not found');

    // Increment view count async
    this.prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    if (!isAdmin) await this.redis.set(cacheKey, post, 600);
    return post;
  }

  async updatePost(authorId: string, postId: string, dto: Partial<CreatePostDto>, isAdmin = false) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (!isAdmin && post.authorId !== authorId) throw new ForbiddenException();

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...dto,
        ...(dto.status === PostStatus.PUBLISHED && !post.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });

    await this.redis.delPattern('blog:*');
    return updated;
  }

  async deletePost(authorId: string, postId: string, isAdmin = false) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (!isAdmin && post.authorId !== authorId) throw new ForbiddenException();

    await this.prisma.post.delete({ where: { id: postId } });
    await this.redis.delPattern('blog:*');
  }

  private async generateSlug(title: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let counter = 1;
    while (await this.prisma.post.findFirst({ where: { slug } })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
