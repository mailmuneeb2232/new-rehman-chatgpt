import { Queue } from 'bullmq';
import { redis } from '@/config/redis';

export const cacheWarmupQueue = new Queue('cache-warmup', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 20,
    removeOnFail: 20,
  },
});
