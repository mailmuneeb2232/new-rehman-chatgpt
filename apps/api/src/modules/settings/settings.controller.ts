import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { BulkUpsertSettingsDto } from './dto/bulk-upsert-settings.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('public')
  getPublicSettings() {
    return this.settingsService.getAllSettings(true);
  }

  @Public()
  @Get('social')
  getSocialLinks() {
    return this.settingsService.getSocialLinks();
  }

  @Public()
  @Get('contact')
  getContactInfo() {
    return this.settingsService.getContactInfo();
  }

  @Public()
  @Get('store')
  getStoreConfig() {
    return this.settingsService.getStoreConfig();
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAllSettings() {
    return this.settingsService.getAllSettings(false);
  }

  @Post('admin')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  upsert(@Body() dto: UpsertSettingDto) {
    return this.settingsService.upsertSetting(dto);
  }

  @Post('admin/bulk')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  bulkUpsert(@Body() dto: BulkUpsertSettingsDto) {
    return this.settingsService.bulkUpsert(dto);
  }

  @Delete('admin/:key')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN)
  delete(@Param('key') key: string) {
    return this.settingsService.deleteSetting(key);
  }
}
