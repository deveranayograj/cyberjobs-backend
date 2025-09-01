import { Global, Module } from '@nestjs/common';
import { AppLogger } from '@app/core/logger/logger.service';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
