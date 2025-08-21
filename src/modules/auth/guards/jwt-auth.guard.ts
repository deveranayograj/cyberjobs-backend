import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisService } from '../../../common/redis/redis.service';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly redisService: RedisService) {
    super();
  }

  // 👇 Only log when error occurs
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        this.logger.error(`JWT expired at ${info.expiredAt}`);
        throw new UnauthorizedException('Token expired');
      }
      this.logger.error(
        `JWT validation failed: ${info?.message || err?.message}`,
      );
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activated = (await super.canActivate(context)) as boolean;
    if (!activated) return false;

    const request = context.switchToHttp().getRequest<Record<string, any>>();
    const authHeader = request.headers['authorization'] as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.error('Access token missing or malformed');
      throw new UnauthorizedException('Access token missing');
    }

    const token = authHeader.split(' ')[1];

    try {
      const isBlacklisted = await this.redisService.get(`bl_${token}`);
      if (isBlacklisted) {
        this.logger.error(`Token ${token} has been logged out`);
        throw new UnauthorizedException('Token has been logged out');
      }
    } catch (err) {
      this.logger.error('Redis error while checking token blacklist', err);
      throw new UnauthorizedException('Cannot validate token'); // fail safe
    }

    return true;
  }
}
