import { Controller, Post, Body, Get, UseGuards, Ip } from '@nestjs/common';
import { MailService } from './mailer.service';
import { SendMailDto } from '../dto/send-mal.dto';
import { SendBulkMailDto } from '../dto/send-bulk-mail.dto';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { MailThrottleGuard } from '../guards/mail-throttle.guard';

@Controller('mail')
@UseGuards(MailThrottleGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @Throttle({ short: { limit: 2, ttl: 60 * 1000 } })
  async sendMail(@Body() sendMailDto: SendMailDto, @Ip() ip: string) {
    return this.mailService.sendMail(sendMailDto, ip);
  }

  @Post('send-bulk')
  @Throttle({ short: { limit: 1, ttl: 300 * 1000 } })
  async sendBulkMails(@Body() sendBulkMailDto: SendBulkMailDto, @Ip() ip: string) {
    if (sendBulkMailDto.emails.length > 10) {
      throw new Error('Bulk email limit exceeded. Maximum 10 emails per batch.');
    }
    return this.mailService.sendBulkMails(sendBulkMailDto.emails, ip);
  }

  @Get('queue-status')
  @Throttle({ short: { limit: 10, ttl: 60 * 1000 } })
  async getQueueStatus() {
    return this.mailService.getQueueStatus();
  }
}