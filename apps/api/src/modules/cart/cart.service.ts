import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) throw new BadRequestException('User ID or session ID required');

    const cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, price: true, compareAtPrice: true, stock: true, isActive: true,
                images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
              },
            },
            variant: { select: { id: true, name: true, value: true, price: true, stock: true, sku: true } },
          },
        },
      },
    });

    if (!cart) return this.emptyCartResponse();
    return this.buildCartResponse(cart);
  }

  async addItem(dto: AddToCartDto, userId?: string, sessionId?: string) {
    if (!userId && !sessionId) throw new BadRequestException('User ID or session ID required');

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, isActive: true, deletedAt: null },
      include: { variants: { where: { id: dto.variantId ?? undefined } } },
    });
    if (!product) throw new NotFoundException('Product not found or unavailable');

    const effectiveStock = dto.variantId
      ? (product.variants[0]?.stock ?? 0)
      : product.stock;

    if (effectiveStock < dto.quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${effectiveStock}`);
    }

    const effectivePrice = dto.variantId
      ? (product.variants[0]?.price ?? product.price)
      : product.price;

    let cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          sessionId,
          expiresAt: userId ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Upsert cart item
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId ?? null,
        },
      },
      update: { quantity: { increment: dto.quantity }, price: effectivePrice },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
        price: effectivePrice,
      },
    });

    return this.getCart(userId, sessionId);
  }

  async updateItem(cartItemId: string, dto: UpdateCartItemDto, userId?: string, sessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true, variant: true },
    });

    if (!item) throw new NotFoundException('Cart item not found');
    if (userId && item.cart.userId !== userId) throw new NotFoundException('Cart item not found');

    const availableStock = item.variantId ? (item.variant?.stock ?? 0) : item.product.stock;
    if (dto.quantity > availableStock) {
      throw new BadRequestException(`Insufficient stock. Available: ${availableStock}`);
    }

    if (dto.quantity <= 0) {
      await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await this.prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity: dto.quantity } });
    }

    return this.getCart(userId, sessionId);
  }

  async removeItem(cartItemId: string, userId?: string, sessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { cart: true } });
    if (!item) throw new NotFoundException('Cart item not found');
    if (userId && item.cart.userId !== userId) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.delete({ where: { id: cartItemId } });
    return this.getCart(userId, sessionId);
  }

  async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.prisma.cart.findFirst({ where: userId ? { userId } : { sessionId } });
    if (!cart) return this.emptyCartResponse();
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.emptyCartResponse();
  }

  async mergeGuestCart(sessionId: string, userId: string) {
    const guestCart = await this.prisma.cart.findFirst({ where: { sessionId }, include: { items: true } });
    if (!guestCart || !guestCart.items.length) return;

    let userCart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!userCart) {
      await this.prisma.cart.update({ where: { id: guestCart.id }, data: { userId, sessionId: null, expiresAt: null } });
      return;
    }

    // Merge items
    for (const item of guestCart.items) {
      await this.prisma.cartItem.upsert({
        where: { cartId_productId_variantId: { cartId: userCart.id, productId: item.productId, variantId: item.variantId ?? null } },
        update: { quantity: { increment: item.quantity } },
        create: { cartId: userCart.id, productId: item.productId, variantId: item.variantId, quantity: item.quantity, price: item.price },
      });
    }
    await this.prisma.cart.delete({ where: { id: guestCart.id } });
  }

  private buildCartResponse(cart: { id: string; items: Array<{ id: string; quantity: number; price: number; product: { id: string; name: string; slug: string; price: number; compareAtPrice: number | null; stock: number; images: Array<{ url: string; alt: string | null }> }; variant: { id: string; name: string; value: string; price: number | null; stock: number; sku: string } | null }> }) {
    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0]?.url ?? null,
      price: item.variant?.price ?? item.product.price,
      quantity: item.quantity,
      subtotal: (item.variant?.price ?? item.product.price) * item.quantity,
      stock: item.variant?.stock ?? item.product.stock,
      variantId: item.variant?.id ?? null,
      variantName: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
      sku: item.variant?.sku ?? null,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    return { id: cart.id, items, subtotal, itemCount };
  }

  private emptyCartResponse() {
    return { id: null, items: [], subtotal: 0, itemCount: 0 };
  }
}
