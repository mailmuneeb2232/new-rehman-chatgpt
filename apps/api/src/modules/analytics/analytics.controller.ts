import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.getDashboardKpis();
  }

  @Get('revenue')
  getRevenue(
    @Query('period') period: 'daily' | 'monthly' | 'yearly' = 'monthly',
    @Query('months', new DefaultValuePipe(12), ParseIntPipe) months: number,
  ) {
    return this.analyticsService.getRevenueChart(period, months);
  }

  @Get('top-products')
  getTopProducts(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.analyticsService.getTopProducts(limit);
  }

  @Get('order-status')
  getOrderStatus() {
    return this.analyticsService.getOrderStatusBreakdown();
  }

  @Get('customer-growth')
  getCustomerGrowth(@Query('months', new DefaultValuePipe(12), ParseIntPipe) months: number) {
    return this.analyticsService.getCustomerGrowth(months);
  }
}
