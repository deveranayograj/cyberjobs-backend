import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from '@app/core/logger/logger.service';
import { LoggerInterceptor } from '@app/core/logger/logger.interceptor';
import { GlobalExceptionFilter } from '@app/core/filters/global-exception.filter';
import { ResponseInterceptor } from '@app/core/interceptors/response.interceptor';
import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  app.enableCors();

  // ✅ Add cookie-parser middleware
  app.use(cookieParser());

  // ✅ Logger interceptor for requests/responses
  app.useGlobalInterceptors(new LoggerInterceptor(logger));

  // ✅ Global response interceptor for structured success responses
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ✅ Global exception filter for all errors
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // ✅ Validation pipe for all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[] = []) => {
        const messages = errors.map((err) =>
          Object.values(err.constraints ?? {}).join(', ')
        );
        return new BadRequestException(messages);
      },
    })
  );

  await app.listen(3000);
  logger.log('🚀 Server running on http://localhost:3000', 'Bootstrap');
}

bootstrap();
