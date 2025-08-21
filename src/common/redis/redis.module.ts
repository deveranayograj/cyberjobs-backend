import { Module, Global } from '@nestjs/common';
import {
  RedisModule as NestRedisModule,
  RedisModuleOptions,
} from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global() // ✅ Make RedisService available globally
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): RedisModuleOptions => {
        const host = config.get<string>('REDIS_HOST') ?? 'localhost';
        const port = config.get<number>('REDIS_PORT') ?? 6379;
        const password = config.get<string>('REDIS_PASSWORD') || undefined;

        const url = password
          ? `redis://${password}@${host}:${port}`
          : `redis://${host}:${port}`;

        return { type: 'single', url };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
