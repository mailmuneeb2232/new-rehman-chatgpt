import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QUEUE_EMAIL, QUEUE_INVOICE, QUEUE_ANALYTICS, QUEUE_CACHE_WARMUP, QUEUE_NOTIFICATIONS } from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: parseInt(new URL(config.get<string>('REDIS_URL', 'redis://localhost:6379')).port || '6379'),
          password: config.get<string>('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_EMAIL },
      { name: QUEUE_INVOICE },
      { name: QUEUE_ANALYTICS },
      { name: QUEUE_CACHE_WARMUP },
      { name: QUEUE_NOTIFICATIONS },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
