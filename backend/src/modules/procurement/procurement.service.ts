import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpdateProcurementActualsInput {
  procurementItemId: string;
  actualPurchasedQty: number;
  actualCostInPaise: number;
  supplierName: string;
  rejectedQty?: number;
}

@Injectable()
export class ProcurementService {
  private readonly logger = new Logger(ProcurementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches the active procurement sheet for today's dawn procurement
   */
  async getTodaySheet() {
    const today = new Date();
    const dateOnly = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const sheet = await this.prisma.procurementSheet.findUnique({
      where: { date: dateOnly },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!sheet) {
      // If no sheet generated for today, return latest
      return this.prisma.procurementSheet.findFirst({
        orderBy: { date: 'desc' },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }

    return sheet;
  }

  /**
   * Updates mandi weighbridge intake and QC rejection counts
   */
  async updateItemActuals(input: UpdateProcurementActualsInput) {
    const existing = await this.prisma.procurementItem.findUnique({
      where: { id: input.procurementItemId },
    });

    if (!existing) {
      throw new NotFoundException(`Procurement item ${input.procurementItemId} not found`);
    }

    const updated = await this.prisma.procurementItem.update({
      where: { id: input.procurementItemId },
      data: {
        actualPurchasedQty: input.actualPurchasedQty,
        actualCostInPaise: input.actualCostInPaise,
        supplierName: input.supplierName,
        rejectedQty: input.rejectedQty ?? existing.rejectedQty,
      },
      include: { product: true },
    });

    this.logger.log(
      `Procurement updated for ${updated.product.name}: Target ${updated.finalProcureTarget}, Bought: ${updated.actualPurchasedQty}, Rejected: ${updated.rejectedQty}`
    );

    return updated;
  }
}
