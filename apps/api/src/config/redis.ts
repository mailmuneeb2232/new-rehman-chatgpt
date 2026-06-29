import { Redis } from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

redis.on('connect', () => {
  console.info('Redis client connected');
});
