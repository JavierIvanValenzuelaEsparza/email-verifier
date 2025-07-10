import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SendMailDto } from '../dto/send-mal.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
    private transporter;
    private readonly logger = new Logger(MailService.name);
    private emailQueue: SendMailDto[] = [];
    private isProcessing = false;
    private lastEmailTime = 0;
    private readonly RATE_LIMIT_DELAY = 2000;
    private readonly MAX_RETRIES = 3;
    private readonly BACKOFF_BASE = 5000;

    constructor(private configService: ConfigService) {
        this.transporter = createTransport({
            host: this.configService.get<string>('EMAIL_HOST'),
            port: this.configService.get<number>('EMAIL_PORT'),
            secure: this.configService.get<string>('EMAIL_SECURE') === 'true',
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            },
            pool: true,
            maxConnections: 1,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 1,
        });

        this.transporter.verify((error, success) => {
            if (error) {
                this.logger.error('SMTP connection error:', error);
            } else {
                this.logger.log('SMTP server is ready to send emails');
            }
        });
    }

    private getHtmlTemplate(name: string, email: string, message: string): string {
        const templatePath = path.join(process.cwd(), 'src', 'templates', 'email.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        html = html
            .replace(/\$\{name\}/g, name)
            .replace(/\$\{email\}/g, email)
            .replace(/\$\{message\}/g, message.replace(/\n/g, '<br>'));
        return html;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async waitForRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastEmail = now - this.lastEmailTime;
        if (timeSinceLastEmail < this.RATE_LIMIT_DELAY) {
            const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastEmail;
            this.logger.log(`Rate limiting: waiting ${waitTime}ms before next email`);
            await this.delay(waitTime);
        }
        this.lastEmailTime = Date.now();
    }

    private async sendEmailWithRetry(sendMailDto: SendMailDto, retryCount = 0): Promise<void> {
        const { name, email, message } = sendMailDto;

        try {
            await this.waitForRateLimit();

            const html = this.getHtmlTemplate(name, email, message);

            const result = await this.transporter.sendMail({
                from: this.configService.get<string>('EMAIL_USER'), // Use authenticated user as sender
                to: this.configService.get<string>('EMAIL_TO'),
                subject: `Nuevo mensaje de ${name} - ${email}`,
                text: `Has recibido un nuevo mensaje de contacto:\n\nNombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
                html,
                replyTo: email,
            });

            this.logger.log(`Email sent successfully to ${email} (Message ID: ${result.messageId})`);
        } catch (error) {
            this.logger.error(`Failed to send email (attempt ${retryCount + 1}):`, error.message);

            if (error.code === 'EAUTH' || error.responseCode === 454 || error.message.includes('Too many login attempts')) {
                if (retryCount < this.MAX_RETRIES) {
                    const backoffDelay = this.BACKOFF_BASE * Math.pow(2, retryCount); // Exponential backoff
                    this.logger.warn(`Rate limited. Retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
                    await this.delay(backoffDelay);
                    return this.sendEmailWithRetry(sendMailDto, retryCount + 1);
                } else {
                    throw new Error(`Failed to send email after ${this.MAX_RETRIES} retries: Rate limit exceeded. Please try again later.`);
                }
            } else {
                throw new Error(`Failed to send email: ${error.message}`);
            }
        }
    }

    async sendMail(sendMailDto: SendMailDto): Promise<{ message: string; queued?: boolean }> {
        if (!this.isProcessing) {
            try {
                await this.sendEmailWithRetry(sendMailDto);
                return { message: 'Email sent successfully' };
            } catch (error) {
                if (error.message.includes('Rate limit exceeded') || error.message.includes('Too many login attempts')) {
                    this.logger.warn('Rate limit hit, queuing email for later processing');
                    this.emailQueue.push(sendMailDto);
                    this.processQueue();
                    return { message: 'Email queued due to rate limits', queued: true };
                }
                throw error;
            }
        } else {
            this.emailQueue.push(sendMailDto);
            return { message: 'Email added to queue', queued: true };
        }
    }

    async sendBulkMails(sendMailDtos: SendMailDto[]): Promise<{ message: string; queued: number; failed: number }> {
        this.logger.log(`Adding ${sendMailDtos.length} emails to queue for bulk processing`);

        this.emailQueue.push(...sendMailDtos);
        if (!this.isProcessing) {
            this.processQueue();
        }
        return {
            message: `${sendMailDtos.length} emails queued for processing`,
            queued: sendMailDtos.length,
            failed: 0
        };
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.emailQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        this.logger.log(`Starting queue processing with ${this.emailQueue.length} emails`);

        const failedEmails: SendMailDto[] = [];

        while (this.emailQueue.length > 0) {
            const emailDto = this.emailQueue.shift();
            if (!emailDto) continue;

            try {
                await this.sendEmailWithRetry(emailDto);
                this.logger.log(`Queue progress: ${this.emailQueue.length} emails remaining`);
            } catch (error) {
                this.logger.error(`Failed to send queued email:`, error.message);
                failedEmails.push(emailDto);
            }
        }

        this.isProcessing = false;

        if (failedEmails.length > 0) {
            this.logger.warn(`Queue processing completed with ${failedEmails.length} failed emails`);
            // Optionally, you could add failed emails back to queue for retry later
        } else {
            this.logger.log('Queue processing completed successfully');
        }
    }

    getQueueStatus(): { queueLength: number; isProcessing: boolean } {
        return {
            queueLength: this.emailQueue.length,
            isProcessing: this.isProcessing
        };
    }
}