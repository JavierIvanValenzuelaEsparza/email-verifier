import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class MailThrottleGuard extends ThrottlerGuard {
  private readonly logger = new Logger(MailThrottleGuard.name);

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    
    const email = req.body?.email;
    if (email) {
      return `${ip}-${email}`;
    }
    
    return ip;
  }

  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.get('User-Agent') || 'unknown';
    const email = request.body?.email || 'unknown';
    
    this.logger.warn(`Rate limit exceeded - IP: ${ip}, Email: ${email}, User-Agent: ${userAgent}, Path: ${request.path}`);
    
    throw new Error('Too many email requests. Please wait before sending another email.');
  }
}
