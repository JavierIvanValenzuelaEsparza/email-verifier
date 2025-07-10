import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailService } from './mailer.service';
import { SendMailDto } from '../dto/send-mal.dto';
import { SendBulkMailDto } from '../dto/send-bulk-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Body() sendMailDto: SendMailDto) {
    return this.mailService.sendMail(sendMailDto);
  }

  @Post('send-bulk')
  async sendBulkMails(@Body() sendBulkMailDto: SendBulkMailDto) {
    return this.mailService.sendBulkMails(sendBulkMailDto.emails);
  }

  @Get('queue-status')
  async getQueueStatus() {
    return this.mailService.getQueueStatus();
  }
}