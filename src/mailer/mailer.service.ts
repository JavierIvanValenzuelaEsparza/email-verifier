import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SendMailDto } from '../dto/send-mal.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<string>('EMAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  private getHtmlTemplate(name: string, email: string, message: string): string {
    const templatePath = path.join(__dirname, '../templates/email.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html
    return html;
  }

  async sendMail(sendMailDto: SendMailDto): Promise<void> {
    const { name, email, message } = sendMailDto;

    try {
      const html = this.getHtmlTemplate(name, email, message);

      await this.transporter.sendMail({
        from: email,
        to: this.configService.get<string>('EMAIL_TO'),
        subject: `Nuevo mensaje de ${name} - ${email}`,
        text: `Has recibido un nuevo mensaje de contacto:\n\nNombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
        html,
        replyTo: email,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}