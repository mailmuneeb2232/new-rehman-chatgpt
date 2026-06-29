import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import type { OrderStatus } from '@prisma/client';

@ApiTags('orders')
@Controller({ path: 'orders', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get my orders' })
  getMyOrders(@CurrentUser('id') userId: string, @Query() pagination: PaginationDto) {
    return this.ordersService.findUserOrders(userId, pagination.page, pagination.limit);
  }

  @Get('my/:id')
  @ApiOperation({ summary: 'Get my order detail' })
  getMyOrder(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.findOrderById(id, userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order from cart' })
  createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.ordersService.createOrder(userId, dto, ip, ua);
  }

  @Patch('my/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel my order' })
  cancelOrder(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, userId, reason);
  }

  // Admin endpoints
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '[ADMIN] List all orders' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll(pagination.page, pagination.limit, status, search);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Order statistics' })
  getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; note?: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.ordersService.updateStatus(id, body.status, body.note, adminId);
  }
}
