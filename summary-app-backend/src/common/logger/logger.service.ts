import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            context,
            trace,
            ...meta,
          });
        })
      ),
      defaultMeta: { service: 'summary-app-backend' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom methods for specific logging scenarios
  logApiRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string) {
    this.logger.info('API Request', {
      method,
      url,
      statusCode,
      responseTime,
      userId,
      type: 'api_request',
    });
  }

  logError(error: Error, context?: string, userId?: string) {
    this.logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      userId,
      type: 'application_error',
    });
  }

  logAiSummary(articleId: string, summaryLength: number, processingTime: number) {
    this.logger.info('AI Summary Generated', {
      articleId,
      summaryLength,
      processingTime,
      type: 'ai_summary',
    });
  }

  logRssFetch(sourceId: string, articlesCount: number, success: boolean, error?: string) {
    this.logger.info('RSS Feed Fetched', {
      sourceId,
      articlesCount,
      success,
      error,
      type: 'rss_fetch',
    });
  }
}