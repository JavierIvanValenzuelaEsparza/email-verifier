import { Module } from '@nestjs/common';
import { MailController } from './mailer.controller'
import { MailService } from './mailer.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60 * 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10 * 60 * 1000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60 * 60 * 1000,
        limit: 20,
      },
    ]),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}