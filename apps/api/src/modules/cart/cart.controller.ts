import { Controller, Get, Post, Patch, Delete, Body, Param, Req, HttpCode, HttpStatus, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('cart')
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get cart (works for both authenticated and guest users)' })
  getCart(@Req() req: Request & { user?: { id: string } }) {
    const sessionId = req.cookies?.['cart_session'] as string | undefined;
    return this.cartService.getCart(req.user?.id, sessionId);
  }

  @Post('items')
  @Public()
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @Body() dto: AddToCartDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const sessionId = req.cookies?.['cart_session'] as string | undefined;
    return this.cartService.addItem(dto, req.user?.id, sessionId);
  }

  @Patch('items/:id')
  @Public()
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const sessionId = req.cookies?.['cart_session'] as string | undefined;
    return this.cartService.updateItem(id, dto, req.user?.id, sessionId);
  }

  @Delete('items/:id')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(
    @Param('id') id: string,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const sessionId = req.cookies?.['cart_session'] as string | undefined;
    return this.cartService.removeItem(id, req.user?.id, sessionId);
  }

  @Delete()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cart' })
  clearCart(@Req() req: Request & { user?: { id: string } }) {
    const sessionId = req.cookies?.['cart_session'] as string | undefined;
    return this.cartService.clearCart(req.user?.id, sessionId);
  }
}
