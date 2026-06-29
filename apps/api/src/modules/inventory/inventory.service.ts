import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getLowStockProducts(threshold?: number) {
    return this.prisma.$queryRaw`
      SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold,
             c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.stock <= COALESCE(${threshold}, p.low_stock_threshold)
      AND p.is_active = true AND p.deleted_at IS NULL
      ORDER BY p.stock ASC
      LIMIT 100
    `;
  }

  async getOutOfStockProducts() {
    return this.prisma.product.findMany({
      where: { stock: 0, isActive: true, deletedAt: null },
      select: { id: true, name: true, sku: true, stock: true, category: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async adjustStock(productId: string, quantity: number, note?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const newStock = product.stock + quantity;
    if (newStock < 0) throw new BadRequestException('Insufficient stock');

    await this.prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
    this.logger.log(`Stock adjusted for ${product.sku}: ${product.stock} → ${newStock} (${quantity > 0 ? '+' : ''}${quantity}) ${note ?? ''}`);

    return { productId, previousStock: product.stock, newStock, adjustment: quantity };
  }

  async bulkAdjust(adjustments: Array<{ productId: string; quantity: number; note?: string }>) {
    return Promise.all(adjustments.map((a) => this.adjustStock(a.productId, a.quantity, a.note)));
  }

  async getInventoryStats() {
    const [totalProducts, outOfStock, lowStock, totalValue] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.product.count({ where: { stock: 0, isActive: true, deletedAt: null } }),
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM products
        WHERE stock > 0 AND stock <= low_stock_threshold
        AND is_active = true AND deleted_at IS NULL
      `,
      this.prisma.$queryRaw<[{ total: bigint }]>`
        SELECT COALESCE(SUM(stock * cost_price), 0) as total
        FROM products WHERE is_active = true AND deleted_at IS NULL
      `,
    ]);

    return {
      totalProducts,
      outOfStock,
      lowStock: Number((lowStock as [{ count: bigint }])[0]?.count ?? 0),
      inventoryValue: Number((totalValue as [{ total: bigint }])[0]?.total ?? 0),
    };
  }
}
