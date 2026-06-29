import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getDashboardKpis() {
    const cacheKey = 'analytics:dashboard';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [totalOrders, todayOrders, monthOrders, lastMonthOrders, revenue, monthRevenue, lastMonthRevenue, totalCustomers, newCustomersMonth, totalProducts, lowStockProducts, pendingOrders] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true, stock: { lte: 5, gt: 0 } } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    ]);

    const monthRevenueVal = monthRevenue._sum.total?.toNumber() ?? 0;
    const lastMonthRevenueVal = lastMonthRevenue._sum.total?.toNumber() ?? 0;
    const revenueGrowth = lastMonthRevenueVal > 0
      ? ((monthRevenueVal - lastMonthRevenueVal) / lastMonthRevenueVal) * 100
      : 0;

    const ordersGrowth = lastMonthOrders > 0
      ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0;

    const result = {
      revenue: {
        total: revenue._sum.total?.toNumber() ?? 0,
        thisMonth: monthRevenueVal,
        lastMonth: lastMonthRevenueVal,
        growth: Math.round(revenueGrowth * 10) / 10,
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
        thisMonth: monthOrders,
        lastMonth: lastMonthOrders,
        growth: Math.round(ordersGrowth * 10) / 10,
        pending: pendingOrders,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersMonth,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
    };

    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async getRevenueChart(period: 'daily' | 'monthly' | 'yearly' = 'monthly', months = 12) {
    const cacheKey = `analytics:revenue:chart:${period}:${months}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const orders = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID', createdAt: { gte: startDate } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    for (const order of orders) {
      let key: string;
      const d = order.createdAt;
      if (period === 'daily') {
        key = d.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = String(d.getFullYear());
      }
      grouped[key] = (grouped[key] ?? 0) + (order.total.toNumber());
    }

    const result = Object.entries(grouped).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));
    await this.redis.set(cacheKey, result, 3600);
    return result;
  }

  async getTopProducts(limit = 10) {
    const cacheKey = `analytics:top-products:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const productIds = result.map((r) => r.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, images: true, price: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const enriched = result.map((r) => ({
      product: productMap.get(r.productId),
      totalRevenue: r._sum.total?.toNumber() ?? 0,
      totalQuantity: r._sum.quantity ?? 0,
      orderCount: r._count.id,
    }));

    await this.redis.set(cacheKey, enriched, 3600);
    return enriched;
  }

  async getOrderStatusBreakdown() {
    const cacheKey = 'analytics:order-status';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const breakdown = result.map((r) => ({ status: r.status, count: r._count.id }));
    await this.redis.set(cacheKey, breakdown, 300);
    return breakdown;
  }

  async getCustomerGrowth(months = 12) {
    const cacheKey = `analytics:customer-growth:${months}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const users = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER', createdAt: { gte: startDate } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    for (const user of users) {
      const key = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = (grouped[key] ?? 0) + 1;
    }

    const result = Object.entries(grouped).map(([month, count]) => ({ month, count }));
    await this.redis.set(cacheKey, result, 3600);
    return result;
  }
}
