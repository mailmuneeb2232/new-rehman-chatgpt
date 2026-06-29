import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      password: config.get<string>('REDIS_PASSWORD'),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('error', (err) => this.logger.error('Redis error:', err));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis { return this.client; }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try { return JSON.parse(value) as T; } catch { return value as unknown as T; }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async hset(key: string, field: string, value: unknown): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value));
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field);
    if (!value) return null;
    try { return JSON.parse(value) as T; } catch { return value as unknown as T; }
  }

  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    const data = await this.client.hgetall(key);
    if (!data || Object.keys(data).length === 0) return null;
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, JSON.parse(v) as T]),
    ) as Record<string, T>;
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return (await this.client.sismember(key, member)) === 1;
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    await this.client.srem(key, ...members);
  }
}
