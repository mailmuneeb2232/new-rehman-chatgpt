import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import type { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  }

  async createPaymentIntent(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'PAID') throw new BadRequestException('Order already paid');

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: order.total,
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
      receipt_email: order.user.email,
      description: `Electronic Store Order #${order.orderNumber}`,
      automatic_payment_methods: { enabled: true },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'PROCESSING',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.total,
      currency: order.currency,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    this.logger.log(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(pi);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(pi);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await this.handleRefund(charge);
        break;
      }
    }

    return { received: true };
  }

  async refundOrder(orderId: string, amount?: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.stripePaymentIntentId) throw new BadRequestException('No payment intent found');
    if (order.paymentStatus !== 'PAID') throw new BadRequestException('Order is not paid');

    const refund = await this.stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      ...(amount && { amount }),
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: amount && amount < order.total ? 'PARTIALLY_REFUNDED' : 'REFUNDED',
        refundAmount: amount ?? order.total,
        refundedAt: new Date(),
        status: 'REFUNDED',
      },
    });

    return { refundId: refund.id, amount: refund.amount };
  }

  private async handlePaymentSuccess(pi: Stripe.PaymentIntent) {
    if (!pi.metadata?.['orderId']) return;
    await this.prisma.order.update({
      where: { id: pi.metadata['orderId'] },
      data: {
        paymentStatus: 'PAID',
        status: 'PAID',
        stripeChargeId: typeof pi.latest_charge === 'string' ? pi.latest_charge : undefined,
      },
    });
    this.logger.log(`Payment succeeded for order: ${pi.metadata['orderId']}`);
  }

  private async handlePaymentFailure(pi: Stripe.PaymentIntent) {
    if (!pi.metadata?.['orderId']) return;
    await this.prisma.order.update({
      where: { id: pi.metadata['orderId'] },
      data: { paymentStatus: 'FAILED', status: 'PAYMENT_FAILED' },
    });
    this.logger.warn(`Payment failed for order: ${pi.metadata['orderId']}`);
  }

  private async handleRefund(charge: Stripe.Charge) {
    if (!charge.payment_intent) return;
    const order = await this.prisma.order.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent as string },
    });
    if (!order) return;
    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'REFUNDED', status: 'REFUNDED', refundedAt: new Date() },
    });
  }
}
