import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    try {
      let result: 'OK' | null;
      if (ttlSeconds != null) {
        result = await this.redis.set(key, value, 'EX', ttlSeconds);
      } else {
        result = await this.redis.set(key, value);
      }
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Redis SET error:', err.message);
      } else {
        console.error('Redis SET error:', String(err));
      }
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const result: string | null = await this.redis.get(key);
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Redis GET error:', err.message);
      } else {
        console.error('Redis GET error:', String(err));
      }
      return null;
    }
  }

  async del(key: string): Promise<number> {
    try {
      const result: number = await this.redis.del(key);
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Redis DEL error:', err.message);
      } else {
        console.error('Redis DEL error:', String(err));
      }
      return 0;
    }
  }
}
