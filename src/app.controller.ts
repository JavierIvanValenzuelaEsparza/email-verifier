import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome(): string {
    return this.appService.getWelcomeMessage();
  }

  @Get('info')
  getApiInfo(): any {
    return this.appService.getApiInfo();
  }

  @Get('status')
  getStatus(): any {
    return {
      status: '🟢 ONLINE',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}