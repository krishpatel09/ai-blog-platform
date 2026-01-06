import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
    success?: boolean;
  }) {
    try {
      await (this.prisma as any).auditLog.create({
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
      console.error('Audit log failed:', error);
    }
  }

  async getUserActivity(userId: string, limit = 50) {
    return await (this.prisma as any).auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

 
}
