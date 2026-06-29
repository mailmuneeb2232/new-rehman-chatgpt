import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured products' })
  getFeatured(@Query('limit') limit = 8) {
    return this.productsService.findFeatured(+limit);
  }

  @Get('best-sellers')
  @Public()
  @ApiOperation({ summary: 'Get best sellers' })
  getBestSellers(@Query('limit') limit = 8) {
    return this.productsService.findBestSellers(+limit);
  }

  @Get('new-arrivals')
  @Public()
  @ApiOperation({ summary: 'Get new arrivals' })
  getNewArrivals(@Query('limit') limit = 8) {
    return this.productsService.findNew(+limit);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get product detail by slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug, true);
  }

  @Get(':id/related')
  @Public()
  @ApiOperation({ summary: 'Get related products' })
  getRelated(@Param('id') id: string, @Query('limit') limit = 6) {
    return this.productsService.findRelated(id, +limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INVENTORY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Create product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INVENTORY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Update product' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Delete product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INVENTORY_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Update stock' })
  updateStock(
    @Param('id') id: string,
    @Body() body: { quantity: number; operation?: 'set' | 'increment' | 'decrement' },
  ) {
    return this.productsService.updateStock(id, body.quantity, body.operation);
  }
}
