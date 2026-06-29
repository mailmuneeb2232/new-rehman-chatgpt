import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  private readonly CACHE_KEY = 'categories:tree';
  private readonly CACHE_TTL = 3600;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getTree() {
    const cached = await this.redis.get(this.CACHE_KEY);
    if (cached) return cached;

    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const tree = categories.filter((c) => !c.parentId);
    await this.redis.set(this.CACHE_KEY, tree, this.CACHE_TTL);
    return tree;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getFeatured() {
    return this.prisma.category.findMany({
      where: { isFeatured: true, isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Category with this name already exists');

    const category = await this.prisma.category.create({ data: { ...dto, slug } });
    await this.redis.del(this.CACHE_KEY);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');
    const category = await this.prisma.category.update({ where: { id }, data: dto });
    await this.redis.del(this.CACHE_KEY);
    return category;
  }

  async remove(id: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');
    await this.prisma.category.delete({ where: { id } });
    await this.redis.del(this.CACHE_KEY);
    return { message: 'Category deleted' };
  }

  async getBreadcrumbs(slug: string): Promise<Array<{ id: string; name: string; slug: string }>> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { parent: { include: { parent: true } } },
    });
    if (!category) return [];
    const crumbs: Array<{ id: string; name: string; slug: string }> = [];
    if ((category as { parent?: { parent?: { id: string; name: string; slug: string } } }).parent?.parent) {
      crumbs.push((category as { parent: { parent: { id: string; name: string; slug: string } } }).parent.parent);
    }
    if ((category as { parent?: { id: string; name: string; slug: string } }).parent) {
      crumbs.push((category as { parent: { id: string; name: string; slug: string } }).parent);
    }
    crumbs.push({ id: category.id, name: category.name, slug: category.slug });
    return crumbs;
  }
}
