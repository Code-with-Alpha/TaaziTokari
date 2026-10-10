// ==============================================================================
// ANTIGRAVITY: PAYMENT GATEWAY WEBHOOK & CRYPTOGRAPHIC VERIFICATION
// Idempotently fulfills orders upon Razorpay / Cashfree server-to-server events.
// Never trusts client-side frontend redirect callbacks.
// ==============================================================================

import { Controller, Post, Req, Res, HttpStatus, Logger, Body, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { OrderService } from '../orders/order.service';

@Controller('payments')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(private readonly orderService: OrderService) {}

  /**
   * Razorpay Webhook Handler
   * Verifies HMAC-SHA256 signature against RAZORPAY_WEBHOOK_SECRET.
   */
  @Post('webhook/razorpay')
  async handleRazorpayWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any
  ) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_antigravity_midnight_cutoff_lucknow_sha256';

    if (!signature) {
      this.logger.warn('Webhook rejected: Missing x-razorpay-signature header');
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing signature header' });
    }

    // Use raw payload string for cryptographic HMAC verification
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    // Constant-time buffer comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      this.logger.error('Cryptographic signature mismatch on payment webhook! Possible replay or spoofing.');
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Invalid webhook signature' });
    }

    const event = body;
    this.logger.log(`Received verified Razorpay webhook event: ${event.event}`);

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.notes?.order_number;
      const paymentId = paymentEntity?.id;

      if (!orderId || !paymentId) {
        this.logger.error('Webhook payload missing payment entity or order id');
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Incomplete payment payload' });
      }

      try {
        // Idempotently transition order state
        await this.orderService.markOrderPaid(orderId, paymentId);
        this.logger.log(`Order ${orderId} successfully confirmed via webhook tx ${paymentId}`);
      } catch (err) {
        this.logger.error(`Failed to fulfill order ${orderId}: ${(err as Error).message}`);
        // Return 500 to signal Razorpay to retry delivery later
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Fulfillment retry needed' });
      }
    }

    return res.status(HttpStatus.OK).json({ status: 'received', timestamp: new Date().toISOString() });
  }

  /**
   * Test harness helper to compute expected HMAC for development & QA simulation
   */
  @Post('webhook/simulate')
  async simulateWebhook(@Body() body: any) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_antigravity_midnight_cutoff_lucknow_sha256';
    const payload = JSON.stringify(body);
    const signature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

    return {
      message: 'Simulated payload signature generated',
      signature,
      payload,
    };
  }
}
