import { LoggerService, Injectable, LogLevel } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  private logLevels: LogLevel[];

  constructor() {
    const level = process.env.LOG_LEVEL ?? 'log';
    this.logLevels = this.mapLogLevel(level);
  }

  private mapLogLevel(level: string): LogLevel[] {
    switch (level) {
      case 'error':
        return ['error'];
      case 'warn':
        return ['error', 'warn'];
      case 'log':
        return ['error', 'warn', 'log'];
      case 'debug':
        return ['error', 'warn', 'log', 'debug'];
      case 'verbose':
        return ['error', 'warn', 'log', 'debug', 'verbose'];
      default:
        return ['error', 'warn', 'log'];
    }
  }

  log(message: string, context?: string) {
    if (this.logLevels.includes('log')) {
      console.log(`[LOG] [${context ?? 'App'}] ${message}`);
    }
  }

  error(message: string, trace?: string, context?: string) {
    if (this.logLevels.includes('error')) {
      console.error(`[ERROR] [${context ?? 'App'}] ${message}`, trace);
    }
  }

  warn(message: string, context?: string) {
    if (this.logLevels.includes('warn')) {
      console.warn(`[WARN] [${context ?? 'App'}] ${message}`);
    }
  }

  debug(message: string, context?: string) {
    if (this.logLevels.includes('debug')) {
      console.debug(`[DEBUG] [${context ?? 'App'}] ${message}`);
    }
  }

  verbose(message: string, context?: string) {
    if (this.logLevels.includes('verbose')) {
      console.info(`[VERBOSE] [${context ?? 'App'}] ${message}`);
    }
  }
}
