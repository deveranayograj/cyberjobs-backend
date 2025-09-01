import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus ? exception.getStatus() : 400;

    const exceptionResponse = exception.getResponse
      ? exception.getResponse()
      : { message: exception.message };

    // Handle class-validator errors
    let errors = [];
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      errors = Array.isArray(exceptionResponse['message'])
        ? exceptionResponse['message']
        : [exceptionResponse['message']];
    }

    response.status(status).json({
      statusCode: status,
      errors,
    });
  }
}
