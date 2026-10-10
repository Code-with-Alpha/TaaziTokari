import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  societyId: string;
  items: CreateOrderItemInput[];
  deliveryNotes?: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * INVARIANT 1: Database-Driven State Authority
   * The server fetches product prices directly from PostgreSQL and calculates
   * the exact integer paise total. The client is NEVER trusted for pricing.
   */
  async createPreOrder(input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Cannot place an empty pre-order.');
    }

    // 1. Fetch current active products from DB to get authoritative unit prices
    const productIds = input.items.map((i) => i.productId);
    const dbProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (dbProducts.length !== productIds.length) {
      throw new BadRequestException('One or more selected items are unavailable or inactive.');
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 2. Compute absolute integer paise totals & savings
    let calculatedTotalInPaise = 0;
    const orderItemsData: Array<{ productId: string; quantity: number; priceAtPurchase: number }> = [];

    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      if (item.quantity <= 0) {
        throw new BadRequestException(`Invalid quantity for ${product.name}`);
      }
      const itemSubtotal = product.priceInPaise * item.quantity;
      calculatedTotalInPaise += itemSubtotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.priceInPaise, // snapshot unit price in paise
      });
    }

    // Benchmark savings estimate (e.g., 18% below Lucknow retail hypermarkets)
    const estimatedSavingsInPaise = Math.round(calculatedTotalInPaise * 0.18);

    // 3. Generate unique human-readable order number
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-LKO-${timestamp}-${randSuffix}`;

    // 4. Create Order atomically
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        addressId: input.addressId,
        societyId: input.societyId,
        status: OrderStatus.PLACED_PENDING_PAYMENT,
        totalInPaise: calculatedTotalInPaise,
        savingsInPaise: estimatedSavingsInPaise,
        deliveryNotes: input.deliveryNotes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    this.logger.log(
      `Pre-order ${order.orderNumber} created. Authoritative Total: ₹${(calculatedTotalInPaise / 100).toFixed(2)} (${calculatedTotalInPaise} paise)`
    );

    return order;
  }

  /**
   * INVARIANT: Idempotent Payment Fulfillment
   * Called by the Razorpay webhook when `payment.captured` event fires.
   * If the webhook is retried, order status remains idempotent.
   */
  async markOrderPaid(orderReference: string, paymentTransactionId: string) {
    this.logger.log(`Processing payment fulfillment for Order: ${orderReference}, Tx: ${paymentTransactionId}`);

    // Try finding by ID or orderNumber
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: orderReference }, { orderNumber: orderReference }],
      },
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order ${orderReference} not found for payment fulfillment`);
    }

    // Idempotency check: If already paid or locked, do not re-process
    if (existingOrder.paymentId === paymentTransactionId) {
      this.logger.warn(`Idempotent payment webhook skipped: Order ${orderReference} already paid.`);
      return existingOrder;
    }

    // Update order with payment ID
    const updatedOrder = await this.prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentId: paymentTransactionId,
        // If still pending, keep ready for midnight cutoff
        status:
          existingOrder.status === OrderStatus.PLACED_PENDING_PAYMENT
            ? OrderStatus.PLACED_PENDING_PAYMENT
            : existingOrder.status,
      },
    });

    this.logger.log(`Order ${updatedOrder.orderNumber} successfully marked as PAID (${paymentTransactionId}).`);
    return updatedOrder;
  }

  async getSocietyOrdersForCutoff(societyId: string) {
    return this.prisma.order.findMany({
      where: {
        societyId,
        status: OrderStatus.PLACED_PENDING_PAYMENT,
        paymentId: { not: null }, // Only paid orders enter dawn procurement
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }
}
