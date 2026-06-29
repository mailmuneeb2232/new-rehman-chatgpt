import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import slugify from 'slugify';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_TTL = { DETAIL: 300, LIST: 120, FEATURED: 600 };

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { page, limit, sortBy, sortOrder, category, brand, minPrice, maxPrice, rating, search, featured, isNew, tags } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(category && { category: { slug: category } }),
      ...(brand && { brand: { slug: brand } }),
      ...(featured !== undefined && { isFeatured: featured }),
      ...(isNew !== undefined && { isNew }),
      ...(minPrice !== undefined || maxPrice !== undefined ? {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      } : {}),
      ...(rating && { avgRating: { gte: rating } }),
      ...(tags?.length && { tags: { hasSome: tags } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
          { brand: { name: { contains: search, mode: 'insensitive' } } },
          { tags: { has: search.toLowerCase() } },
        ],
      }),
    };

    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: this.listSelect,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items: products, meta: buildPaginationMeta(total, page, limit) };
  }

  async findBySlug(slug: string, incrementView = false) {
    const cacheKey = `product:detail:${slug}`;
    const cached = await this.redis.get(cacheKey);
    if (cached && !incrementView) return cached;

    const product = await this.prisma.product.findUnique({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        attributes: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true, parentId: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true } },
        reviews: {
          where: { status: 'APPROVED' },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (incrementView) {
      void this.prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } });
    }

    await this.redis.set(cacheKey, product, this.CACHE_TTL.DETAIL);
    return product;
  }

  async findFeatured(limit = 8) {
    const cacheKey = `products:featured:${limit}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true, deletedAt: null },
      take: limit,
      orderBy: { soldCount: 'desc' },
      select: this.listSelect,
    });

    await this.redis.set(cacheKey, products, this.CACHE_TTL.FEATURED);
    return products;
  }

  async findBestSellers(limit = 8) {
    return this.prisma.product.findMany({
      where: { isBestSeller: true, isActive: true, deletedAt: null },
      take: limit,
      orderBy: { soldCount: 'desc' },
      select: this.listSelect,
    });
  }

  async findNew(limit = 8) {
    return this.prisma.product.findMany({
      where: { isNew: true, isActive: true, deletedAt: null },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: this.listSelect,
    });
  }

  async findRelated(productId: string, limit = 6) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, brandId: true, tags: true },
    });
    if (!product) return [];

    return this.prisma.product.findMany({
      where: {
        id: { not: productId },
        isActive: true,
        deletedAt: null,
        OR: [
          { categoryId: product.categoryId },
          ...(product.brandId ? [{ brandId: product.brandId }] : []),
        ],
      },
      take: limit,
      orderBy: { soldCount: 'desc' },
      select: this.listSelect,
    });
  }

  async create(dto: CreateProductDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        costPrice: dto.costPrice,
        sku: dto.sku,
        barcode: dto.barcode,
        stock: dto.stock ?? 0,
        lowStockThreshold: dto.lowStockThreshold ?? 5,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        tags: dto.tags ?? [],
        isFeatured: dto.isFeatured ?? false,
        isNew: dto.isNew ?? true,
        isActive: dto.isActive ?? true,
        weight: dto.weight,
        model3dUrl: dto.model3dUrl,
        videoUrl: dto.videoUrl,
        metaTitle: dto.metaTitle ?? dto.name,
        metaDescription: dto.metaDescription ?? dto.shortDescription,
        publishedAt: dto.isActive ? new Date() : null,
        images: dto.images?.length ? {
          createMany: {
            data: dto.images.map((img, idx) => ({
              url: img.url,
              alt: img.alt ?? dto.name,
              isPrimary: idx === 0,
              sortOrder: idx,
            })),
          },
        } : undefined,
        variants: dto.variants?.length ? {
          createMany: { data: dto.variants },
        } : undefined,
        attributes: dto.attributes?.length ? {
          createMany: { data: dto.attributes.map((a, i) => ({ ...a, sortOrder: i })) },
        } : undefined,
      },
      include: { images: true, variants: true, attributes: true },
    });

    await this.invalidateCache();
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    const data: Prisma.ProductUpdateInput = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
      ...(dto.stock !== undefined && { stock: dto.stock }),
      ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
      ...(dto.isNew !== undefined && { isNew: dto.isNew }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.model3dUrl !== undefined && { model3dUrl: dto.model3dUrl }),
    };

    const product = await this.prisma.product.update({ where: { id }, data, include: { images: true, variants: true } });

    await this.redis.del(`product:detail:${existing.slug}`);
    await this.invalidateCache();
    return product;
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    await this.redis.del(`product:detail:${product.slug}`);
    await this.invalidateCache();
    return { message: 'Product deleted' };
  }

  async updateStock(productId: string, quantity: number, operation: 'set' | 'increment' | 'decrement' = 'set') {
    const update = operation === 'set' ? { stock: quantity }
      : operation === 'increment' ? { stock: { increment: quantity } }
      : { stock: { decrement: quantity } };

    return this.prisma.product.update({ where: { id: productId }, data: update, select: { id: true, stock: true, lowStockThreshold: true } });
  }

  async findByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids }, isActive: true, deletedAt: null },
      select: this.listSelect,
    });
  }

  async getLowStockProducts() {
    return this.prisma.$queryRaw`
      SELECT id, name, sku, stock, "low_stock_threshold"
      FROM products
      WHERE stock <= "low_stock_threshold"
      AND is_active = true
      AND deleted_at IS NULL
      ORDER BY stock ASC
    `;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name, { lower: true, strict: true });
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${slug}-${Date.now()}`;
    return slug;
  }

  private buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Prisma.ProductOrderByWithRelationInput {
    const orderMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
      price: { price: sortOrder },
      name: { name: sortOrder },
      rating: { avgRating: sortOrder },
      popularity: { soldCount: sortOrder },
      newest: { createdAt: 'desc' },
    };
    return orderMap[sortBy ?? ''] ?? { createdAt: 'desc' };
  }

  private async invalidateCache() {
    await this.redis.delPattern('products:*');
  }

  private readonly listSelect = {
    id: true, name: true, slug: true, price: true, compareAtPrice: true,
    stock: true, avgRating: true, reviewCount: true, soldCount: true,
    isFeatured: true, isNew: true, isBestSeller: true,
    images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
    category: { select: { id: true, name: true, slug: true } },
    brand: { select: { id: true, name: true, slug: true } },
  };
}
