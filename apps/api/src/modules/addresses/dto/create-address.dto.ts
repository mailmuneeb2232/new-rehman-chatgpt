import { IsString, IsOptional, IsBoolean, Length, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({ default: 'Home' }) @IsOptional() @IsString() label?: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(50) firstName: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(50) lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() company?: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(200) line1: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) line2?: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() state: string;
  @ApiProperty() @IsString() postalCode: string;
  @ApiProperty({ example: 'US' }) @IsString() @Length(2, 2) country: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}
