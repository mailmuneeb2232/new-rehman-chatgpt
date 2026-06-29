import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { BulkUpsertSettingsDto } from './dto/bulk-upsert-settings.dto';

const SETTINGS_CACHE_KEY = 'site:settings';
const SETTINGS_TTL = 3600;

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getAllSettings(publicOnly = false) {
    const cacheKey = publicOnly ? `${SETTINGS_CACHE_KEY}:public` : SETTINGS_CACHE_KEY;
    const cached = await this.redis.get<Record<string, string>>(cacheKey);
    if (cached) return cached;

    const where = publicOnly ? { isPublic: true } : {};
    const rows = await this.prisma.siteSetting.findMany({ where, orderBy: { key: 'asc' } });

    const result = rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    await this.redis.set(cacheKey, result, SETTINGS_TTL);
    return result;
  }

  async getSetting(key: string): Promise<string | null> {
    const all = await this.getAllSettings();
    return all[key] ?? null;
  }

  async upsertSetting(dto: UpsertSettingDto) {
    const setting = await this.prisma.siteSetting.upsert({
      where: { key: dto.key },
      update: { value: dto.value, description: dto.description, isPublic: dto.isPublic },
      create: {
        key: dto.key,
        value: dto.value,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
      },
    });
    await this.invalidateCache();
    return setting;
  }

  async bulkUpsert(dto: BulkUpsertSettingsDto) {
    const operations = dto.settings.map((s) =>
      this.prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value, description: s.description, isPublic: s.isPublic },
        create: {
          key: s.key,
          value: s.value,
          description: s.description,
          isPublic: s.isPublic ?? false,
        },
      }),
    );
    const results = await this.prisma.$transaction(operations);
    await this.invalidateCache();
    return results;
  }

  async deleteSetting(key: string) {
    const setting = await this.prisma.siteSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    await this.prisma.siteSetting.delete({ where: { key } });
    await this.invalidateCache();
  }

  // Convenience methods for common settings
  async getSocialLinks() {
    const all = await this.getAllSettings();
    return {
      facebook: all['social.facebook'] ?? null,
      twitter: all['social.twitter'] ?? null,
      instagram: all['social.instagram'] ?? null,
      youtube: all['social.youtube'] ?? null,
      tiktok: all['social.tiktok'] ?? null,
      linkedin: all['social.linkedin'] ?? null,
      pinterest: all['social.pinterest'] ?? null,
      snapchat: all['social.snapchat'] ?? null,
      whatsapp: all['social.whatsapp'] ?? null,
    };
  }

  async getContactInfo() {
    const all = await this.getAllSettings();
    return {
      email: all['contact.email'] ?? null,
      phone: all['contact.phone'] ?? null,
      address: all['contact.address'] ?? null,
      city: all['contact.city'] ?? null,
      country: all['contact.country'] ?? null,
      postalCode: all['contact.postalCode'] ?? null,
    };
  }

  async getStoreConfig() {
    const all = await this.getAllSettings();
    return {
      storeName: all['store.name'] ?? 'Electronic Store',
      storeTagline: all['store.tagline'] ?? null,
      storeLogo: all['store.logo'] ?? null,
      storeFavicon: all['store.favicon'] ?? null,
      currency: all['store.currency'] ?? 'USD',
      currencySymbol: all['store.currencySymbol'] ?? '$',
      timezone: all['store.timezone'] ?? 'UTC',
      maintenanceMode: all['store.maintenanceMode'] === 'true',
      taxRate: parseFloat(all['store.taxRate'] ?? '0'),
      freeShippingThreshold: parseFloat(all['store.freeShippingThreshold'] ?? '0'),
    };
  }

  private async invalidateCache() {
    await Promise.all([
      this.redis.del(SETTINGS_CACHE_KEY),
      this.redis.del(`${SETTINGS_CACHE_KEY}:public`),
    ]);
  }
}
