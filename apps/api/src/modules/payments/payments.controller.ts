import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId/intent')
  @ApiOperation({ summary: 'Create Stripe payment intent for order' })
  createIntent(@Param('orderId') orderId: string, @CurrentUser('id') userId: string) {
    return this.paymentsService.createPaymentIntent(orderId, userId);
  }

  @Post('orders/:orderId/refund')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '[ADMIN] Refund order' })
  refund(@Param('orderId') orderId: string, @Body('amount') amount?: number) {
    return this.paymentsService.refundOrder(orderId, amount);
  }
}
