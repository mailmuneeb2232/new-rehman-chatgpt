import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NOTIFICATIONS, JOB_SEND_USER_NOTIFICATION } from '../queue.constants';
import { PrismaService } from '../../prisma/prisma.service';

@Processor(QUEUE_NOTIFICATIONS)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== JOB_SEND_USER_NOTIFICATION) return;

    const { userId, type, title, message, link } = job.data;
    await this.prisma.notification.create({
      data: { userId, type, title, message, link },
    });
    this.logger.log(`Notification created for user ${userId}: ${title}`);
  }
}
