import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('brands')
@Controller({ path: 'brands', version: '1' })
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get() @Public() @ApiOperation({ summary: 'List all brands' })
  findAll() { return this.brandsService.findAll(); }

  @Get('featured') @Public() @ApiOperation({ summary: 'Get featured brands' })
  getFeatured() { return this.brandsService.findFeatured(); }

  @Get(':slug') @Public() @ApiOperation({ summary: 'Get brand by slug' })
  findOne(@Param('slug') slug: string) { return this.brandsService.findBySlug(slug); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Create brand' })
  create(@Body() dto: CreateBrandDto) { return this.brandsService.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN] Update brand' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) { return this.brandsService.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  remove(@Param('id') id: string) { return this.brandsService.remove(id); }
}
