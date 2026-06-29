import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_INVOICE, JOB_GENERATE_INVOICE } from '../queue.constants';
import { PrismaService } from '../../prisma/prisma.service';

@Processor(QUEUE_INVOICE)
export class InvoiceProcessor extends WorkerHost {
  private readonly logger = new Logger(InvoiceProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== JOB_GENERATE_INVOICE) return;

    const { orderId } = job.data as { orderId: string };
    this.logger.log(`Generating invoice for order: ${orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      return;
    }

    const invoiceNumber = `INV-${order.orderNumber}`;
    await this.prisma.order.update({
      where: { id: orderId },
      data: { invoiceNumber },
    });

    this.logger.log(`Invoice ${invoiceNumber} generated for order ${orderId}`);
  }
}
