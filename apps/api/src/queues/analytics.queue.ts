import { Queue } from 'bullmq';
import { redis } from '@/config/redis';

export const analyticsQueue = new Queue('analytics', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 200,
    removeOnFail: 50,
  },
});
