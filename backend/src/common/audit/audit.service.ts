import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Writes an immutable audit entry to PostgreSQL.
   */
  async logAction(params: {
    action: AuditAction;
    entityName: string;
    entityId?: string;
    actorId: string;
    details: Record<string, any>;
    ipAddress?: string;
  }) {
    const { action, entityName, entityId, actorId, details, ipAddress } = params;

    try {
      const record = await this.prisma.auditLog.create({
        data: {
          action,
          entityName,
          entityId,
          actorId,
          details,
          ipAddress,
        },
      });

      this.logger.log(
        `[AUDIT] Action: ${action} on ${entityName} (${entityId || 'N/A'}) by Actor: ${actorId}`
      );

      return record;
    } catch (error) {
      this.logger.error(`Failed to record audit log: ${(error as Error).message}`, (error as Error).stack);
      // In production, we ensure audit failure alerts pagerduty/sentry
      throw error;
    }
  }
}
