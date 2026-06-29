import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_EMAIL, JOB_SEND_ORDER_CONFIRMATION, JOB_SEND_OWNER_ORDER_NOTIFICATION, JOB_SEND_WELCOME_EMAIL, JOB_SEND_PASSWORD_RESET, JOB_SEND_SHIPPING_UPDATE } from '../queue.constants';
import { EmailService } from '../../email/email.service';

@Processor(QUEUE_EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing email job: ${job.name} [${job.id}]`);

    switch (job.name) {
      case JOB_SEND_ORDER_CONFIRMATION:
        return this.emailService.sendOrderConfirmation(job.data);
      case JOB_SEND_OWNER_ORDER_NOTIFICATION:
        return this.emailService.sendOwnerOrderNotification(job.data);
      case JOB_SEND_WELCOME_EMAIL:
        return this.emailService.sendWelcomeEmail(job.data);
      case JOB_SEND_PASSWORD_RESET:
        return this.emailService.sendPasswordReset(job.data);
      case JOB_SEND_SHIPPING_UPDATE:
        return this.emailService.sendShippingUpdate(job.data);
      default:
        this.logger.warn(`Unknown email job: ${job.name}`);
    }
  }
}
