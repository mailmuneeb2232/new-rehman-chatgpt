import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';
import type { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: this.safeSelect });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, phone: dto.phone, avatar: dto.avatar },
      select: this.safeSelect,
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: this.safeSelect,
    });
  }

  async deactivateAccount(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true },
    });
  }

  // Admin methods
  async findAll(page: number, limit: number, search?: string, role?: UserRole) {
    const skip = (page - 1) * limit;
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: this.safeSelect }),
      this.prisma.user.count({ where }),
    ]);

    return { items: users, meta: buildPaginationMeta(total, page, limit) };
  }

  async updateRole(userId: string, role: UserRole, requesterId: string) {
    const requester = await this.prisma.user.findUnique({ where: { id: requesterId }, select: { role: true } });
    if (requester?.role !== 'SUPER_ADMIN' && role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can assign super admin role');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: this.safeSelect,
    });
  }

  async getStats() {
    const [total, active, admins, newThisMonth] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
      this.prisma.user.count({
        where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
      }),
    ]);
    return { total, active, admins, newThisMonth };
  }

  private readonly safeSelect = {
    id: true, email: true, name: true, role: true,
    emailVerified: true, avatar: true, phone: true,
    isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true,
  };
}
