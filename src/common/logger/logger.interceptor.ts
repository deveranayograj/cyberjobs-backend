import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppLogger } from './logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const start = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(`${method} ${url} - ${Date.now() - start}ms`, 'HTTP'),
        ),
      );
  }
}
