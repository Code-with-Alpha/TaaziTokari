// ==============================================================================
// ANTIGRAVITY: NESTJS PRODUCTION BOOTSTRAP
// Modular Monolith API Gateway with Helmet, Strict CORS, and Throttling
// ==============================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AntigravityBootstrap');
  const app = await NestFactory.create(AppModule, {
    // Preserve raw body for cryptographic HMAC SHA-256 webhook verification
    rawBody: true,
  });

  const port = process.env.PORT || 4000;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // 1. Helmet Security Middleware (HSTS, X-Content-Type-Options, Frameguard)
  app.use(helmet());

  // 2. Cookie Parser for HttpOnly Refresh Tokens
  app.use(cookieParser());

  // 3. Strict CORS lock down to production domains
  app.enableCors({
    origin: [frontendUrl, 'https://taazitokari.in', 'https://admin.taazitokari.in'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  });

  // 4. Global Validation Pipe (strip unexpected fields)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(port);
  logger.log(`🚀 Antigravity Modular Monolith API running on http://localhost:${port}`);
  logger.log(`🔒 Midnight Cutoff Worker active on BullMQ Redis queue`);
}

bootstrap();
