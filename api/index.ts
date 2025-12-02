import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

const expressApp = express();
let cachedApp: INestApplication;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async (req: Request, res: Response) => {
  await bootstrap();
  return expressApp(req, res);
};
