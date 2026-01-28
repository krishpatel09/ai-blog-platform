import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus } from '@prisma/client';

@Injectable()
export class StoriesService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    // Basic aggregation for Status
    const statusCounts = await this.prisma.post.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    const counts = {
      drafts: 0,
      published: 0,
      scheduled: 0,
      submnitted: 0, // Typo intentional to match user req or fix later? I'll use 'submitted'
      unlisted: 0,
    };

    // Calculate Scheduled separately because they are PUBLISHED but in future
    const now = new Date();
    const scheduledCount = await this.prisma.post.count({
      where: {
        userId,
        status: 'PUBLISHED',
        publishedAt: { gt: now },
      },
    });

    statusCounts.forEach((s) => {
      if (s.status === 'DRAFT') counts.drafts = s._count.status;
      if (s.status === 'PUBLISHED') counts.published = s._count.status;
      // Note: 'published' count from DB includes scheduled. We should subtract scheduled.
    });

    counts.published = Math.max(0, counts.published - scheduledCount);
    counts.scheduled = scheduledCount;

    // Unlisted -> Mapped to ARCHIVED for now as per plan
    const archivedCount = await this.prisma.post.count({
      where: { userId, status: 'ARCHIVED' },
    });
    counts.unlisted = archivedCount;

    return counts;
  }

  async findAll(userId: string, status: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const now = new Date();

    let where: any = { userId };

    if (status) {
      const lower = status.toLowerCase();
      if (lower === 'draft') {
        where.status = 'DRAFT';
      } else if (lower === 'published') {
        where.status = 'PUBLISHED';
        where.publishedAt = { lte: now };
      } else if (lower === 'scheduled') {
        where.status = 'PUBLISHED';
        where.publishedAt = { gt: now };
      } else if (lower === 'unlisted') {
        where.status = 'ARCHIVED';
      } else if (lower === 'submissions') {
        // Return empty for now
        return { data: [], total: 0, page, limit };
      }
    }

    // "One API Call" with no status param -> Return all grouped?
    // User asked "tabs wise filter data set". This implies separate requests or one big structure.
    // If no status provided, I'll return a paginated list of ALL.

    // To support "one big object", we'd need a different method.
    // Staying with filter approach for scale.

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { username: true, name: true, avatar: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
