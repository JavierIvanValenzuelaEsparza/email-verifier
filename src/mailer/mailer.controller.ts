import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mailer.service';
import { SendMailDto } from '../dto/send-mal.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendMail(@Body() sendMailDto: SendMailDto) {
    return this.mailService.sendMail(sendMailDto);
  }
}