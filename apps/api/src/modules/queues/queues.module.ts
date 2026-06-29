import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  QUEUE_EMAIL, QUEUE_INVOICE, QUEUE_ANALYTICS,
  QUEUE_CACHE_WARMUP, QUEUE_NOTIFICATIONS,
} from './queue.constants';
import { EmailProcessor } from './processors/email.processor';
import { InvoiceProcessor } from './processors/invoice.processor';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_EMAIL },
      { name: QUEUE_INVOICE },
      { name: QUEUE_ANALYTICS },
      { name: QUEUE_CACHE_WARMUP },
      { name: QUEUE_NOTIFICATIONS },
    ),
    PrismaModule,
    RedisModule,
    EmailModule,
  ],
  providers: [EmailProcessor, InvoiceProcessor, AnalyticsProcessor, NotificationsProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
