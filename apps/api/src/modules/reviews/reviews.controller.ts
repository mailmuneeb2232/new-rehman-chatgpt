import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseIntPipe, DefaultValuePipe, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(userId, dto);
  }

  @Public()
  @Get('product/:productId')
  getProductReviews(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful',
  ) {
    return this.reviewsService.getProductReviews(productId, page, limit, sort);
  }

  @Post(':id/helpful')
  @ApiBearerAuth()
  voteHelpful(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.voteHelpful(userId, id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(userId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  delete(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.deleteReview(userId, id);
  }

  @Get('admin/pending')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getPending(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.getPendingReviews(page, limit);
  }

  @Patch('admin/:id/moderate')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  moderate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderateReview(id, dto);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  adminDelete(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.deleteReview(userId, id, true);
  }
}
