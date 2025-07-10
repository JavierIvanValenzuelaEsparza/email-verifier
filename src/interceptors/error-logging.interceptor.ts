import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
  Ip,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.get('User-Agent') || 'unknown';
    const path = request.path;

    return next.handle().pipe(
      catchError((error) => {
        this.logger.error(
          `Error in ${path} from IP: ${ip}, User-Agent: ${userAgent}, Error: ${error.message}`,
          error.stack,
        );

        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (error.message.includes('Too many requests') || 
            error.message.includes('Rate limit') ||
            error.message.includes('quota exceeded')) {
          statusCode = HttpStatus.TOO_MANY_REQUESTS;
          message = error.message;
        } else if (error.message.includes('spam') || 
                   error.message.includes('Invalid email') ||
                   error.message.includes('required')) {
          statusCode = HttpStatus.BAD_REQUEST;
          message = error.message;
        }

        return throwError(() => new HttpException(message, statusCode));
      }),
    );
  }
}
