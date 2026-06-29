import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const MAX_COMPARE = 4;

@Injectable()
export class CompareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(sessionId: string) {
    return `compare:${sessionId}`;
  }

  async getCompareList(sessionId: string) {
    const ids: string[] = (await this.redis.get(this.cacheKey(sessionId))) ?? [];
    if (!ids.length) return [];

    return this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, name: true, slug: true, price: true, comparePrice: true,
        images: true, rating: true, reviewCount: true, stock: true,
        brand: { select: { name: true, logo: true } },
        category: { select: { name: true } },
        attributes: { select: { name: true, value: true } },
      },
    });
  }

  async addToCompare(sessionId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const ids: string[] = (await this.redis.get(this.cacheKey(sessionId))) ?? [];

    if (ids.includes(productId)) {
      throw new BadRequestException('Product already in compare list');
    }
    if (ids.length >= MAX_COMPARE) {
      throw new BadRequestException(`Cannot compare more than ${MAX_COMPARE} products`);
    }

    ids.push(productId);
    await this.redis.set(this.cacheKey(sessionId), ids, 3600);
    return { ids, count: ids.length };
  }

  async removeFromCompare(sessionId: string, productId: string) {
    const ids: string[] = (await this.redis.get(this.cacheKey(sessionId))) ?? [];
    const filtered = ids.filter((id) => id !== productId);
    await this.redis.set(this.cacheKey(sessionId), filtered, 3600);
    return { ids: filtered, count: filtered.length };
  }

  async clearCompare(sessionId: string) {
    await this.redis.del(this.cacheKey(sessionId));
    return { ids: [], count: 0 };
  }
}
