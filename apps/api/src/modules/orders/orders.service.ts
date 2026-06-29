import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateOrderDto } from './dto/create-order.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type { OrderStatus, Prisma } from '@prisma/client';
import {
  QUEUE_EMAIL,
  QUEUE_ANALYTICS,
  QUEUE_INVOICE,
  QUEUE_NOTIFICATIONS,
  JOB_SEND_ORDER_CONFIRMATION,
  JOB_SEND_OWNER_ORDER_NOTIFICATION,
  JOB_GENERATE_INVOICE,
  JOB_TRACK_ORDER_EVENT,
  JOB_SEND_USER_NOTIFICATION,
} from '../queues/queue.constants';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_INVOICE) private readonly invoiceQueue: Queue,
    @InjectQueue(QUEUE_ANALYTICS) private readonly analyticsQueue: Queue,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notifQueue: Queue,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto, ip?: string, userAgent?: string) {
    // 1. Validate address belongs to user
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    // 2. Get user's cart
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || !cart.items.length) throw new BadRequestException('Cart is empty');

    // 3. Validate all items and calculate totals
    const validatedItems: Array<{
      productId: string;
      variantId: string | null;
      name: string;
      sku: string;
      image: string;
      price: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of cart.items) {
      if (!item.product.isActive || item.product.deletedAt) {
        throw new BadRequestException(`Product "${item.product.name}" is no longer available`);
      }

      const effectiveStock = item.variantId ? (item.variant?.stock ?? 0) : item.product.stock;
      if (effectiveStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.product.name}". Available: ${effectiveStock}`,
        );
      }

      const effectivePrice = item.variantId
        ? (item.variant?.price ?? item.product.price)
        : item.product.price;

      const primaryImage = await this.prisma.productImage.findFirst({
        where: { productId: item.productId, isPrimary: true },
        select: { url: true },
      });

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        sku: item.variant?.sku ?? item.product.sku,
        image: primaryImage?.url ?? '',
        price: effectivePrice,
        quantity: item.quantity,
        subtotal: effectivePrice * item.quantity,
      });
    }

    const subtotal = validatedItems.reduce((sum, i) => sum + i.subtotal, 0);

    // 4. Apply coupon if provided
    let discount = 0;
    let coupon = null;
    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && coupon.startsAt <= new Date() && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          discount = this.calculateDiscount(coupon.type, coupon.value, subtotal, coupon.maxDiscountAmount);
        }
      }
    }

    // 5. Calculate tax and shipping
    const taxRate = 0.085; // 8.5% — should come from settings in production
    const shippingCost = subtotal >= 10000 ? 0 : 999; // Free shipping above $100
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * taxRate);
    const total = taxableAmount + tax + shippingCost;

    // 6. Generate order number
    const orderNumber = this.generateOrderNumber();

    // 7. Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: dto.addressId,
          paymentMethod: dto.paymentMethod,
          couponId: coupon?.id,
          couponCode: dto.couponCode?.toUpperCase(),
          subtotal,
          taxRate,
          tax,
          shippingCost,
          discount,
          total,
          notes: dto.notes,
          ipAddress: ip,
          userAgent,
          items: {
            createMany: { data: validatedItems },
          },
        },
        include: {
          items: true,
          address: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // Add initial status history
      await tx.orderStatusHistory.create({
        data: { orderId: newOrder.id, status: 'PENDING', note: 'Order placed by customer' },
      });

      // Decrement stock
      for (const item of validatedItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              soldCount: { increment: item.quantity },
            },
          });
        }
      }

      // Track coupon usage
      if (coupon && discount > 0) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: { couponId: coupon.id, userId, orderId: newOrder.id, discount },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    this.logger.log(`Order created: ${orderNumber} by user ${userId} — $${(total / 100).toFixed(2)}`);

    // 8. Queue async jobs
    const orderData = {
      orderId: order.id,
      orderNumber,
      customerName: order.user.name,
      customerEmail: order.user.email,
      items: validatedItems,
      address,
      subtotal,
      discount,
      tax,
      shippingCost,
      total,
      paymentMethod: dto.paymentMethod,
      createdAt: order.createdAt,
    };

    await Promise.all([
      this.emailQueue.add(JOB_SEND_ORDER_CONFIRMATION, orderData, { priority: 1, attempts: 3 }),
      this.emailQueue.add(JOB_SEND_OWNER_ORDER_NOTIFICATION, orderData, { priority: 1, attempts: 3 }),
      this.invoiceQueue.add(JOB_GENERATE_INVOICE, { orderId: order.id }, { attempts: 3 }),
      this.analyticsQueue.add(JOB_TRACK_ORDER_EVENT, { orderId: order.id, total, userId }, { attempts: 2 }),
      this.notifQueue.add(JOB_SEND_USER_NOTIFICATION, {
        userId,
        type: 'ORDER_PLACED',
        title: 'Order Confirmed!',
        message: `Your order #${orderNumber} has been placed. We'll notify you when it ships.`,
        data: { orderId: order.id, orderNumber },
      }, { attempts: 2 }),
    ]);

    return order;
  }

  async findUserOrders(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { select: { id: true, name: true, image: true, price: true, quantity: true, subtotal: true } },
          address: true,
        },
      }),
      this.prisma.order.count({ where: { userId, deletedAt: null } }),
    ]);
    return { items: orders, meta: buildPaginationMeta(total, page, limit) };
  }

  async findOrderById(id: string, userId?: string) {
    const where: Prisma.OrderWhereUniqueInput = { id };
    const order = await this.prisma.order.findUnique({
      where,
      include: {
        items: {
          include: {
            product: { select: { id: true, slug: true } },
            variant: { select: { id: true, name: true, value: true } },
          },
        },
        address: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        invoice: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId) throw new ForbiddenException('Access denied');
    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Order not found');

    const cancellableStatuses: OrderStatus[] = ['PENDING', 'PAYMENT_PENDING'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(`Order in status ${order.status} cannot be cancelled`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED', cancelReason: reason },
      });

      await tx.orderStatusHistory.create({
        data: { orderId, status: 'CANCELLED', note: reason ?? 'Cancelled by customer', createdBy: userId },
      });

      // Restore stock
      for (const item of await tx.orderItem.findMany({ where: { orderId } })) {
        if (item.variantId) {
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        } else {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity }, soldCount: { decrement: item.quantity } } });
        }
      }

      return updatedOrder;
    });

    return updated;
  }

  async updateStatus(orderId: string, status: OrderStatus, note?: string, adminId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
    });

    await this.prisma.orderStatusHistory.create({
      data: { orderId, status, note, createdBy: adminId },
    });

    // Queue notifications for specific status changes
    const user = await this.prisma.user.findUnique({ where: { id: order.userId }, select: { email: true, name: true } });
    if (!user) return updated;

    if (status === 'SHIPPED') {
      await this.emailQueue.add(JOB_SEND_ORDER_SHIPPED, { orderId, orderNumber: order.orderNumber, customerEmail: user.email, customerName: user.name, trackingNumber: order.trackingNumber }, { attempts: 3 });
    }

    await this.notifQueue.add(JOB_SEND_USER_NOTIFICATION, {
      userId: order.userId,
      type: status === 'SHIPPED' ? 'ORDER_SHIPPED' : status === 'DELIVERED' ? 'ORDER_DELIVERED' : status === 'CANCELLED' ? 'ORDER_CANCELLED' : 'SYSTEM',
      title: `Order #${order.orderNumber} Update`,
      message: `Your order status has been updated to: ${status.replace(/_/g, ' ')}`,
      data: { orderId, status },
    });

    return updated;
  }

  async findAll(page: number, limit: number, status?: OrderStatus, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { select: { id: true, name: true, quantity: true, price: true } },
          address: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items: orders, meta: buildPaginationMeta(total, page, limit) };
  }

  async getOrderStats() {
    const [total, pending, processing, revenue] = await this.prisma.$transaction([
      this.prisma.order.count({ where: { deletedAt: null } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: { in: ['PAID', 'PREPARING', 'READY_TO_SHIP', 'SHIPPED'] } } }),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
    ]);
    return {
      total,
      pending,
      processing,
      totalRevenue: revenue._sum.total ?? 0,
    };
  }

  private calculateDiscount(
    type: string,
    value: number,
    subtotal: number,
    maxDiscount: number | null,
  ): number {
    let discount = 0;
    if (type === 'PERCENTAGE') {
      discount = Math.round(subtotal * (value / 100));
    } else if (type === 'FIXED_AMOUNT') {
      discount = Math.min(value, subtotal);
    } else if (type === 'FREE_SHIPPING') {
      discount = 999; // shipping cost
    }
    if (maxDiscount && discount > maxDiscount) discount = maxDiscount;
    return discount;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ES-${timestamp}-${random}`;
  }
}
