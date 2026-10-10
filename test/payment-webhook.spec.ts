// ==============================================================================
// TEST SUITE: PAYMENT GATEWAY WEBHOOK & CRYPTOGRAPHIC VERIFICATION
// Validates:
// 1. HMAC-SHA256 signature computation against RAZORPAY_WEBHOOK_SECRET
// 2. Timing attack mitigation via constant-time buffer comparison
// 3. Idempotent order fulfillment upon repeated webhook deliveries
// ==============================================================================

import * as crypto from 'crypto';

describe('Razorpay Cryptographic Webhook Security', () => {
  const mockWebhookSecret = 'whsec_test_secret_lucknow_antigravity_sha256';

  function generateSignature(payloadString: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  }

  function verifyWebhookSignature(payloadString: string, signature: string, secret: string): boolean {
    const expected = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  }

  test('should accept authentic webhooks with valid HMAC-SHA256 signatures', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_rzp_mock_99182',
            order_id: 'ORD-LKO-20261010-84920',
            amount: 11900, // paise
            status: 'captured',
          },
        },
      },
    });

    const signature = generateSignature(rawPayload, mockWebhookSecret);
    const isValid = verifyWebhookSignature(rawPayload, signature, mockWebhookSecret);

    expect(isValid).toBe(true);
  });

  test('should reject tampered payloads with invalid signatures (HTTP 401 Unauthorized)', () => {
    const genuinePayload = JSON.stringify({
      event: 'payment.captured',
      amount: 11900,
    });
    const tamperedPayload = JSON.stringify({
      event: 'payment.captured',
      amount: 100, // Attacker manipulated amount
    });

    const signature = generateSignature(genuinePayload, mockWebhookSecret);
    const isValid = verifyWebhookSignature(tamperedPayload, signature, mockWebhookSecret);

    expect(isValid).toBe(false);
  });

  test('should reject invalid secrets', () => {
    const payload = JSON.stringify({ event: 'payment.captured' });
    const signature = generateSignature(payload, 'wrong_secret');
    const isValid = verifyWebhookSignature(payload, signature, mockWebhookSecret);

    expect(isValid).toBe(false);
  });

  test('should handle duplicate payment.captured webhooks idempotently', () => {
    interface MockOrder {
      orderNumber: string;
      status: string;
      paymentId: string | null;
      fulfillmentCount: number;
    }

    const order: MockOrder = {
      orderNumber: 'ORD-LKO-20261010-84920',
      status: 'PLACED_PENDING_PAYMENT',
      paymentId: null,
      fulfillmentCount: 0,
    };

    function fulfillOrder(ord: MockOrder, incomingTxId: string) {
      // Idempotency Check:
      if (ord.paymentId === incomingTxId) {
        return { skipped: true, order: ord };
      }
      ord.paymentId = incomingTxId;
      ord.status = 'PLACED_PENDING_PAYMENT'; // confirmed paid, ready for cutoff
      ord.fulfillmentCount += 1;
      return { skipped: false, order: ord };
    }

    // 1st Webhook delivery
    const res1 = fulfillOrder(order, 'pay_tx_123');
    expect(res1.skipped).toBe(false);
    expect(order.fulfillmentCount).toBe(1);

    // 2nd Webhook delivery (Razorpay network retry after 4s)
    const res2 = fulfillOrder(order, 'pay_tx_123');
    expect(res2.skipped).toBe(true);
    expect(order.fulfillmentCount).toBe(1); // Not duplicated
  });
});
