import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IResponse<T> {
    success: boolean;
    statusCode: number;
    data: T;
    timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<IResponse<T>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        return next.handle().pipe(
            map((data) => ({
                success: true,
                statusCode: ctx.getResponse().statusCode || 200,
                data,
                timestamp: new Date().toISOString(),
            })),
        );
    }
}
