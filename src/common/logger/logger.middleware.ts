import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '@common/logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) { }

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`${req.method} ${req.originalUrl}`, 'Middleware');
    next();
  }
}
