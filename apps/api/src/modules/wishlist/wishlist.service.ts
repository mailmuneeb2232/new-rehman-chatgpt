import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getWishlist(userId: string) {
    const cacheKey = `wishlist:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            images: true, rating: true, reviewCount: true, stock: true,
            brand: { select: { name: true } },
          },
        },
      },
    });

    await this.redis.set(cacheKey, items, 120);
    return items;
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    if (existing) throw new BadRequestException('Product already in wishlist');

    const item = await this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: { select: { id: true, name: true, slug: true, price: true, images: true } } },
    });

    await this.redis.del(`wishlist:${userId}`);
    return item;
  }

  async removeFromWishlist(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    if (!item) throw new NotFoundException('Item not in wishlist');

    await this.prisma.wishlistItem.delete({ where: { id: item.id } });
    await this.redis.del(`wishlist:${userId}`);
  }

  async clearWishlist(userId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId } });
    await this.redis.del(`wishlist:${userId}`);
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    return !!item;
  }

  async moveToCart(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    if (!item) throw new NotFoundException('Item not in wishlist');

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.stock < 1) throw new BadRequestException('Product out of stock');

    await this.prisma.$transaction(async (tx) => {
      await tx.wishlistItem.delete({ where: { id: item.id } });
      const existingCartItem = await tx.cartItem.findFirst({
        where: { cart: { userId }, productId },
      });
      if (existingCartItem) {
        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: { increment: 1 } },
        });
      } else {
        let cart = await tx.cart.findFirst({ where: { userId } });
        if (!cart) cart = await tx.cart.create({ data: { userId } });
        await tx.cartItem.create({ data: { cartId: cart.id, productId, quantity: 1 } });
      }
    });

    await Promise.all([
      this.redis.del(`wishlist:${userId}`),
      this.redis.del(`cart:user:${userId}`),
    ]);
  }
}
