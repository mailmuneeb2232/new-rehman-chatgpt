import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_ANALYTICS, JOB_TRACK_ORDER_EVENT, JOB_TRACK_PAGE_VIEW } from '../queue.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Processor(QUEUE_ANALYTICS)
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case JOB_TRACK_ORDER_EVENT:
        return this.trackOrder(job.data);
      case JOB_TRACK_PAGE_VIEW:
        return this.trackPageView(job.data);
      default:
        this.logger.warn(`Unknown analytics job: ${job.name}`);
    }
  }

  private async trackOrder(data: { orderId: string; total: number; userId: string }) {
    const today = new Date().toISOString().split('T')[0];
    const key = `analytics:revenue:${today}`;
    await this.redis.incr(key);
    await this.redis.expire(key, 86400 * 90);
    await this.redis.del('analytics:dashboard');
    this.logger.log(`Tracked order event for order ${data.orderId}`);
  }

  private async trackPageView(data: { path: string; userId?: string }) {
    const today = new Date().toISOString().split('T')[0];
    const key = `analytics:pageviews:${today}`;
    await this.redis.incr(key);
    await this.redis.expire(key, 86400 * 90);
  }
}
