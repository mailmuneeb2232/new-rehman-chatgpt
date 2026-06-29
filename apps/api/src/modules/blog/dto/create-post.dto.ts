import { IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @MinLength(50)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaDescription?: string;
}
