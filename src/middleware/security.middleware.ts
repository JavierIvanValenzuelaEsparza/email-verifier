import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private suspiciousIPs = new Map<string, { count: number; firstSeen: number }>();
  private readonly SUSPICIOUS_THRESHOLD = 20;
  private readonly HOUR_IN_MS = 60 * 60 * 1000;

  use(req: any, res: any, next: any) {
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers?.['user-agent'] || 'unknown';
    const now = Date.now();

    const ipData = this.suspiciousIPs.get(ip);
    if (ipData) {
      if (now - ipData.firstSeen > this.HOUR_IN_MS) {
        this.suspiciousIPs.set(ip, { count: 1, firstSeen: now });
      } else {
        ipData.count++;
        if (ipData.count > this.SUSPICIOUS_THRESHOLD) {
          this.logger.warn(`Suspicious activity detected from IP: ${ip}, User-Agent: ${userAgent}, Requests: ${ipData.count}`);
        }
      }
    } else {
      this.suspiciousIPs.set(ip, { count: 1, firstSeen: now });
    }

    if (req.path?.includes('/mail/')) {
      this.logger.log(`Mail request from IP: ${ip}, Path: ${req.path}, User-Agent: ${userAgent}`);
    }

    if (this.isSuspiciousUserAgent(userAgent)) {
      this.logger.warn(`Suspicious User-Agent detected: ${userAgent} from IP: ${ip}`);
    }

    next();
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /okhttp/i,
      /^$/,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }
}
