import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import type { User } from '@prisma/client';
import {
  QUEUE_EMAIL,
  QUEUE_NOTIFICATIONS,
  JOB_SEND_WELCOME_EMAIL,
  JOB_SEND_PASSWORD_RESET,
  JOB_SEND_EMAIL_VERIFICATION,
} from '../queues/queue.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectQueue(QUEUE_EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notifQueue: Queue,
  ) {}

  async register(dto: RegisterDto, ip: string, res: Response) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('An account with this email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        password: hashedPassword,
      },
      select: this.userSelect,
    });

    // Queue welcome email + verification
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await this.prisma.emailVerification.create({
      data: { userId: user.id, token: verificationToken, expiresAt },
    });

    await this.emailQueue.add(
      JOB_SEND_WELCOME_EMAIL,
      { userId: user.id, name: user.name, email: user.email },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    await this.emailQueue.add(
      JOB_SEND_EMAIL_VERIFICATION,
      { userId: user.id, name: user.name, email: user.email, token: verificationToken },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    // Issue tokens
    const tokens = await this.issueTokens(user.id, res, ip, 'unknown');

    this.logger.log(`New user registered: ${user.email} from ${ip}`);

    return { message: 'Account created. Please verify your email.', user, tokens: { accessToken: tokens.accessToken } };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.deletedAt) return null;

    // Check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        `Account locked. Try again after ${user.lockedUntil.toISOString()}`,
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      const maxAttempts = this.config.get<number>('MAX_LOGIN_ATTEMPTS', 5);
      const newAttempts = user.loginAttempts + 1;
      const isNowLocked = newAttempts >= maxAttempts;
      const lockoutMinutes = this.config.get<number>('LOCKOUT_DURATION_MINUTES', 15);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: isNowLocked
            ? new Date(Date.now() + lockoutMinutes * 60 * 1000)
            : null,
        },
      });
      return null;
    }

    // Reset attempts on success
    if (user.loginAttempts > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null },
      });
    }

    return user;
  }

  async login(user: User, res: Response, ip: string, userAgent: string) {
    if (!user.isActive) throw new ForbiddenException('Account is deactivated');

    const tokens = await this.issueTokens(user.id, res, ip, userAgent);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    const safeUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: this.userSelect,
    });

    return { message: 'Login successful', user: safeUser, accessToken: tokens.accessToken };
  }

  async logout(refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
    }
    this.clearCookies(res);
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string | undefined, res: Response, ip: string, userAgent: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token not found');

    const storedToken = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!storedToken) throw new UnauthorizedException('Invalid refresh token');

    // Token theft detection: reuse of a revoked token → revoke entire family
    if (storedToken.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { family: storedToken.family },
        data: { revokedAt: new Date() },
      });
      this.clearCookies(res);
      throw new UnauthorizedException('Token reuse detected. Please login again.');
    }

    if (storedToken.expiresAt < new Date()) {
      this.clearCookies(res);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: storedToken.userId } });
    if (!user || !user.isActive || user.deletedAt) {
      this.clearCookies(res);
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.issueTokens(user.id, res, ip, userAgent, storedToken.family);
    return { accessToken: tokens.accessToken };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return same message to prevent email enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    // Invalidate existing tokens
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });

    await this.emailQueue.add(
      JOB_SEND_PASSWORD_RESET,
      { userId: user.id, name: user.name, email: user.email, token },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findUnique({ where: { token } });

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } }),
      this.prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      // Revoke all refresh tokens on password change
      this.prisma.refreshToken.updateMany({
        where: { userId: reset.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully. Please login.' };
  }

  async verifyEmail(token: string) {
    const verification = await this.prisma.emailVerification.findUnique({ where: { token } });

    if (!verification || verification.verifiedAt || verification.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: verification.userId }, data: { emailVerified: true } }),
      this.prisma.emailVerification.update({ where: { id: verification.id }, data: { verifiedAt: new Date() } }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    // Revoke all other refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password changed successfully' };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId }, select: this.userSelect });
  }

  private async issueTokens(
    userId: string,
    res: Response,
    ip: string,
    userAgent: string,
    existingFamily?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
    if (!user) throw new UnauthorizedException();

    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Refresh token
    const refreshTokenValue = uuidv4();
    const family = existingFamily ?? uuidv4();
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshExpiresMs = this.parseExpiry(refreshExpiresIn);
    const refreshExpiresAt = new Date(Date.now() + refreshExpiresMs);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenValue,
        family,
        ipAddress: ip,
        userAgent,
        expiresAt: refreshExpiresAt,
      },
    });

    const isProd = this.config.get('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshTokenValue, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: refreshExpiresMs,
      path: '/api/v1/auth/refresh',
    });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  private clearCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/(\d+)([smhd])/);
    if (!match || !match[1] || !match[2]) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] ?? 86400000);
  }

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    emailVerified: true,
    avatar: true,
    phone: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };
}
