import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(code: string, userId: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.startsAt > new Date()) throw new BadRequestException('Coupon is not yet active');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Coupon has expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount is $${(coupon.minOrderAmount / 100).toFixed(2)}`);
    }

    if (coupon.perUserLimit) {
      const userUsage = await this.prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
      if (userUsage >= coupon.perUserLimit) throw new BadRequestException('You have already used this coupon');
    }

    const discount = this.calculateDiscount(coupon.type, coupon.value, subtotal, coupon.maxDiscountAmount);

    return {
      valid: true,
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      discount,
    };
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [coupons, total] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.coupon.count(),
    ]);
    return { items: coupons, meta: buildPaginationMeta(total, page, limit) };
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new BadRequestException('Coupon code already exists');
    return this.prisma.coupon.create({ data: { ...dto, code: dto.code.toUpperCase() } });
  }

  async update(id: string, dto: UpdateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted' };
  }

  private calculateDiscount(type: string, value: number, subtotal: number, maxDiscount: number | null): number {
    let discount = 0;
    if (type === 'PERCENTAGE') discount = Math.round(subtotal * (value / 100));
    else if (type === 'FIXED_AMOUNT') discount = Math.min(value, subtotal);
    else if (type === 'FREE_SHIPPING') discount = 999;
    if (maxDiscount && discount > maxDiscount) discount = maxDiscount;
    return discount;
  }
}
