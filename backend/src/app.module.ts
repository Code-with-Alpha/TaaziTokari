import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';

import { PrismaService } from './prisma/prisma.service';
import { OrderService } from './modules/orders/order.service';
import { PaymentWebhookController } from './modules/payments/payment-webhook.controller';
import { ProcurementService } from './modules/procurement/procurement.service';
import { CutoffProcessor } from './modules/cutoff/cutoff.processor';
import { AuditService } from './common/audit/audit.service';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting & Hardening: 5 requests per minute per IP for sensitive endpoints
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => [
        {
          ttl: 60000, // 60 seconds
          limit: 100, // Global limit
        },
      ],
    }),

    // BullMQ with Redis 7 for scheduled midnight cutoff
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD', 'antigravity_redis_pass'),
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'midnight-cutoff-queue',
    }),
  ],
  controllers: [PaymentWebhookController],
  providers: [
    PrismaService,
    AuditService,
    OrderService,
    ProcurementService,
    CutoffProcessor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
