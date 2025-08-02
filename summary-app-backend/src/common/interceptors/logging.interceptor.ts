import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, user } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.logApiRequest(
            method,
            url,
            response.statusCode,
            responseTime,
            user?.id
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.logApiRequest(
            method,
            url,
            response.statusCode || 500,
            responseTime,
            user?.id
          );
          this.logger.logError(error, `${method} ${url}`, user?.id);
        },
      })
    );
  }
}