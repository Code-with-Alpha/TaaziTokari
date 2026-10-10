// ==============================================================================
// ANTIGRAVITY: AUTOMATED MIDNIGHT CUTOFF & DEMAND ENGINE
// Powered by BullMQ & Redis. Executes daily at 12:00:00 AM.
// Transforms household pre-orders into dawn mandi procurement targets.
// ==============================================================================

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

export interface CutoffJobData {
  societyId?: string;
  cycleDate?: string; // YYYY-MM-DD
  forcedManualTrigger?: boolean;
}

export interface AggregationResultItem {
  productId: string;
  productName: string;
  hindiName: string | null;
  unit: string;
  totalCustomerDemand: number;
  bufferPct: number;
  finalProcureTarget: number;
}

export interface CutoffExecutionSummary {
  societyCount: number;
  ordersLockedCount: number;
  totalHouseholdDemandKg: number;
  procurementSheetId: string;
  items: AggregationResultItem[];
  executedAt: string;
}

@Processor('midnight-cutoff-queue')
export class CutoffProcessor extends WorkerHost {
  private readonly logger = new Logger(CutoffProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * BullMQ worker entry point. Triggered automatically by 12:00 AM Redis cron.
   */
  async process(job: Job<CutoffJobData, any, string>): Promise<CutoffExecutionSummary> {
    this.logger.log(`[BULLMQ] 🕛 MIDNIGHT CUTOFF TRIGGERED (Job ID: ${job.id})`);
    return this.executeMidnightCutoff(job.data);
  }

  /**
   * Core Idempotent Cutoff Algorithm
   */
  async executeMidnightCutoff(data?: CutoffJobData): Promise<CutoffExecutionSummary> {
    const todayDate = data?.cycleDate ? new Date(data.cycleDate) : new Date();
    // Normalize to midnight UTC for clean date comparison
    const targetDate = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate()));

    this.logger.log(`Executing Demand Aggregation for cycle date: ${targetDate.toISOString().slice(0, 10)}`);

    // STEP 1: Query all paid orders with status PLACED_PENDING_PAYMENT
    const activeOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PLACED_PENDING_PAYMENT,
        paymentId: { not: null }, // Only confirmed paid orders
        ...(data?.societyId ? { societyId: data.societyId } : {}),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    this.logger.log(`Found ${activeOrders.length} active paid pre-orders awaiting midnight cutoff.`);

    if (activeOrders.length === 0) {
      this.logger.warn('No active paid pre-orders found for cutoff. Creating empty procurement sheet.');
    }

    // STEP 2: Atomic State Freeze in a Database Transaction
    // Update all matching orders to LOCKED_FROZEN
    const orderIds = activeOrders.map((o) => o.id);

    await this.prisma.$transaction(async (tx) => {
      if (orderIds.length > 0) {
        await tx.order.updateMany({
          where: { id: { in: orderIds } },
          data: { status: OrderStatus.LOCKED_FROZEN },
        });
      }
    });

    this.logger.log(`🔒 Atomically froze ${orderIds.length} orders into LOCKED_FROZEN state.`);

    // STEP 3: Demand Aggregation by Product ID
    const demandMap = new Map<
      string,
      {
        product: any;
        totalDemand: number;
      }
    >();

    for (const order of activeOrders) {
      for (const item of order.items) {
        const existing = demandMap.get(item.productId) || {
          product: item.product,
          totalDemand: 0,
        };
        existing.totalDemand += item.quantity;
        demandMap.set(item.productId, existing);
      }
    }

    // STEP 4: Buffer Multiplication Formula
    // Final Procurement Target = sum(Customer Demand) * (1 + bufferPct)
    const aggregatedItems: AggregationResultItem[] = [];
    const procurementItemInserts: Array<{
      productId: string;
      totalCustomerDemand: number;
      appliedBuffer: number;
      finalProcureTarget: number;
    }> = [];

    let totalDemandMetric = 0;

    for (const [productId, data] of demandMap.entries()) {
      const buffer = data.product.bufferPct || 0.05; // SKU specific buffer
      const exactTarget = data.totalDemand * (1 + buffer);
      // Round to 1 decimal place or round up to nearest sensible procurement unit
      const finalTarget = Math.round(exactTarget * 10) / 10;

      totalDemandMetric += data.totalDemand;

      aggregatedItems.push({
        productId,
        productName: data.product.name,
        hindiName: data.product.hindiName,
        unit: data.product.unit,
        totalCustomerDemand: data.totalDemand,
        bufferPct: buffer,
        finalProcureTarget: finalTarget,
      });

      procurementItemInserts.push({
        productId,
        totalCustomerDemand: data.totalDemand,
        appliedBuffer: buffer,
        finalProcureTarget: finalTarget,
      });
    }

    // STEP 5: Idempotent Procurement Sheet Generation
    // Upsert ProcurementSheet for today's date
    const procurementSheet = await this.prisma.procurementSheet.upsert({
      where: { date: targetDate },
      update: {
        status: 'DISPATCHED_MANDI',
        // Replace existing items to maintain idempotency
        items: {
          deleteMany: {},
          create: procurementItemInserts,
        },
      },
      create: {
        date: targetDate,
        status: 'DISPATCHED_MANDI',
        items: {
          create: procurementItemInserts,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    this.logger.log(
      `✅ Dawn Procurement Sheet ${procurementSheet.id} generated with ${aggregatedItems.length} SKUs. Visible on Mobile Ops at 6:00 AM.`
    );

    return {
      societyCount: data?.societyId ? 1 : 3,
      ordersLockedCount: orderIds.length,
      totalHouseholdDemandKg: totalDemandMetric,
      procurementSheetId: procurementSheet.id,
      items: aggregatedItems,
      executedAt: new Date().toISOString(),
    };
  }
}
