import { IsString, IsInt, IsOptional, IsBoolean, IsArray, IsNumber, Min, IsUrl, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ProductImageDto {
  @ApiProperty() @IsUrl() url: string;
  @ApiPropertyOptional() @IsOptional() @IsString() alt?: string;
}

class ProductVariantDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() value: string;
  @ApiProperty() @IsString() sku: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) stock?: number;
}

class ProductAttributeDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() value: string;
}

export class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() shortDescription?: string;
  @ApiProperty() @IsInt() @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) compareAtPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) costPrice?: number;
  @ApiProperty() @IsString() sku: string;
  @ApiPropertyOptional() @IsOptional() @IsString() barcode?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) stock?: number;
  @ApiPropertyOptional({ default: 5 }) @IsOptional() @IsInt() @Min(0) lowStockThreshold?: number;
  @ApiProperty() @IsUUID() categoryId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() brandId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isNew?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional() @IsOptional() @IsUrl() model3dUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() metaDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductImageDto) images?: ProductImageDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductVariantDto) variants?: ProductVariantDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductAttributeDto) attributes?: ProductAttributeDto[];
}
