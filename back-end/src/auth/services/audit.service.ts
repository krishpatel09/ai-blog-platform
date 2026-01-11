import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) { }

  async log(data: {
    userId?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
    success?: boolean;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          details: data.details,
          success: data.success ?? true,
        },
      });
    } catch (error) {
      this.logger.error(`Audit logging failed: ${error.message}`);
    }
  }


}
