import { Controller, Get, Post, Delete, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser('id') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post(':productId')
  add(@CurrentUser('id') userId: string, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete('clear')
  clear(@CurrentUser('id') userId: string) {
    return this.wishlistService.clearWishlist(userId);
  }

  @Delete(':productId')
  remove(@CurrentUser('id') userId: string, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Post(':productId/move-to-cart')
  moveToCart(@CurrentUser('id') userId: string, @Param('productId', ParseUUIDPipe) productId: string) {
    return this.wishlistService.moveToCart(userId, productId);
  }
}
