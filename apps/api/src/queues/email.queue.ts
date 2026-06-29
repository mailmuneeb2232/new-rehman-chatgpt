import { Queue, Worker } from 'bullmq';
import { redis } from '@/config/redis';

export const emailQueue = new Queue('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export function createEmailWorker() {
  return new Worker(
    'email',
    async (job) => {
      // Email job processor — implemented per job.name
      void job;
    },
    { connection: redis, concurrency: 5 },
  );
}
