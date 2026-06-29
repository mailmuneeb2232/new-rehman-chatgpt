import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PostStatus, UserRole } from '@prisma/client';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get()
  getPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('tag') tag: string,
  ) {
    return this.blogService.getPosts(page, limit, tag);
  }

  @Public()
  @Get(':slug')
  getPost(@Param('slug') slug: string) {
    return this.blogService.getPost(slug);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@CurrentUser('id') authorId: string, @Body() dto: CreatePostDto) {
    return this.blogService.createPost(authorId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(
    @CurrentUser('id') authorId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePostDto>,
  ) {
    return this.blogService.updatePost(authorId, id, dto, true);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  delete(@CurrentUser('id') authorId: string, @Param('id') id: string) {
    return this.blogService.deletePost(authorId, id, true);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAllAdmin(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status: PostStatus,
  ) {
    return this.blogService.getPosts(page, limit, undefined, status);
  }
}
