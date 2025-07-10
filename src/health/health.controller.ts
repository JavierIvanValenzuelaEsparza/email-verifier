import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('health')
@UseGuards(ThrottlerGuard)
export class HealthController {
  @Get()
  @Throttle({ short: { limit: 5, ttl: 60 * 1000 } })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'email-verifier',
      message: 'Service is running with anti-abuse protection',
    };
  }

  @Get('rate-limits')
  @Throttle({ short: { limit: 2, ttl: 60 * 1000 } })
  getRateLimits() {
    return {
      limits: {
        emailSend: {
          perMinute: 2,
          per10Minutes: 10,
          perHour: 20,
        },
        bulkEmail: {
          per5Minutes: 1,
          maxBatchSize: 10,
        },
      },
      message: 'These are the current rate limits to prevent abuse',
    };
  }
}
