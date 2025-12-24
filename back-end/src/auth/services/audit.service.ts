import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: number;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
    success?: boolean;
  }) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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

  async getUserActivity(userId: number, limit = 50) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getFailedLoginAttempts(email: string, since: Date) {
    // This would require additional logic to track by email before user is found
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        details: { contains: email },
        createdAt: { gte: since },
      },
    });
  }
}
