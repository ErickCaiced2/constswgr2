import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

// [ADAPTIVE] This logger reads configuration from environment variables
// [CORRECTIVE] Structured logger with ISO timestamps and severity levels
@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    const level = process.env.LOG_LEVEL || 'info';
    const transports: winston.transport[] = [
      new winston.transports.Console(),
    ];

    // Optional file logging
    if (process.env.LOG_FILE) {
      transports.push(
        new winston.transports.File({ filename: process.env.LOG_FILE }),
      );
    }

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp({ format: () => new Date().toISOString() }),
        winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
          const metaString = Object.keys(meta || {}).length
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `[${timestamp}] ${level.toUpperCase()} - ${message}${metaString}`;
        }),
      ),
      transports,
      exitOnError: false,
    });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }
}

