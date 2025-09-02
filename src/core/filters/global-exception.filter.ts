import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppLogger } from '@app/core/logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: AppLogger) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string | any;

        // Handle HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.getResponse();
        } else {
            // Handle unexpected errors
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
        }

        // Log the error with proper string formatting for AppLogger
        this.logger.error(
            JSON.stringify({
                message: message instanceof Object ? message : message,
                path: request.url,
                method: request.method,
            }),
            exception instanceof Error ? exception.stack : undefined,
            'GlobalExceptionFilter',
        );

        // Send standardized JSON response to client
        response.status(status).json({
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}
