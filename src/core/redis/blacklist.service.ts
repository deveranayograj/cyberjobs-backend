// core/redis/blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class BlacklistService {
    constructor(private readonly redisService: RedisService) { }

    async addToken(token: string, userId: bigint, expiresInSeconds: number) {
        const key = `bl_${token}`;
        await this.redisService.set(key, userId.toString(), expiresInSeconds);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const key = `bl_${token}`;
        const exists = await this.redisService.get(key);
        return !!exists;
    }
}
