import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('inventory')
@Controller({ path: 'inventory', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'INVENTORY_ADMIN')
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stats') @ApiOperation({ summary: 'Inventory statistics' })
  getStats() { return this.inventoryService.getInventoryStats(); }

  @Get('low-stock') @ApiOperation({ summary: 'Products with low stock' })
  getLowStock(@Query('threshold') threshold?: number) { return this.inventoryService.getLowStockProducts(threshold); }

  @Get('out-of-stock') @ApiOperation({ summary: 'Out of stock products' })
  getOutOfStock() { return this.inventoryService.getOutOfStockProducts(); }

  @Post(':id/adjust') @ApiOperation({ summary: 'Adjust product stock' })
  adjust(@Param('id') id: string, @Body() body: { quantity: number; note?: string }) {
    return this.inventoryService.adjustStock(id, body.quantity, body.note);
  }

  @Post('bulk-adjust') @ApiOperation({ summary: 'Bulk adjust stock' })
  bulkAdjust(@Body() body: { adjustments: Array<{ productId: string; quantity: number; note?: string }> }) {
    return this.inventoryService.bulkAdjust(body.adjustments);
  }
}
