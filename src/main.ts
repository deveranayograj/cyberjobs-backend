import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from '@common/logger/logger.service';
import { LoggerInterceptor } from '@common/logger/logger.interceptor';
import { AllExceptionsFilter } from '@common/logger/logger.filter';
import { ValidationExceptionFilter } from '@common/filters/validation-exception.filter';
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

  app.useGlobalInterceptors(new LoggerInterceptor(logger));
  app.useGlobalFilters(
    new AllExceptionsFilter(logger),
    new ValidationExceptionFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[] = []) => {
        const messages = errors.map((err) =>
          Object.values(err.constraints ?? {}).join(', '),
        );
        return new BadRequestException(messages);
      },
    }),
  );

  await app.listen(3000);
  logger.log('🚀 Server running on http://localhost:3000', 'Bootstrap');
}

bootstrap();
