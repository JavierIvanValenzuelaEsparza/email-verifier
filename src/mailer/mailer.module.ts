import { Module } from '@nestjs/common';
import { MailController } from './mailer.controller'
import { MailService } from './mailer.service';

@Module({
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}