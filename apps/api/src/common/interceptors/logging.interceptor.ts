import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    const { method, url, ip } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} ${res.statusCode} ${ms}ms [${ip}] [${requestId}]`);
        },
        error: (err: Error) => {
          const ms = Date.now() - start;
          this.logger.error(`${method} ${url} ERROR ${ms}ms [${requestId}] ${err.message}`);
        },
      }),
    );
  }
}
