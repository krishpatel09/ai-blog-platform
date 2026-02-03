import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertHistory(userId: string, postId: string) {
    // Check if entry exists to minimize write operations if unnecessary (though upsert handles this, logic might differ)
    // For ReadingHistory, we want to increment viewCount on each visit (if that's the requirement?)
    // Requirement: "If the user has read the post before, update the updatedAt and increment viewCount. If not, create a new record."

    return this.prisma.readingHistory.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      update: {
        viewCount: { increment: 1 },
        updatedAt: new Date(), // Explicitly update to bring to top
      },
      create: {
        userId,
        postId,
        viewCount: 1,
        progress: 0,
      },
    });
  }

  async updateProgress(userId: string, postId: string, progress: number) {
    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    const existing = await this.prisma.readingHistory.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { progress: true },
    });

    if (!existing) {
      // Ideally tracking starts before progress, but if missed, create it
      return this.prisma.readingHistory.create({
        data: {
          userId,
          postId,
          progress,
          viewCount: 1,
        },
      });
    }

    // "Implement a check to ensure progress only increases"
    if (progress > existing.progress) {
      return this.prisma.readingHistory.update({
        where: { userId_postId: { userId, postId } },
        data: { progress },
      });
    }

    return existing; // No update needed
  }

  async getUserHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.readingHistory.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
              excerpt: true,
              readTime: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
              likeCount: true,
              commentCount: true,
            },
          },
        },
      }),
      this.prisma.readingHistory.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteHistoryItem(userId: string, postId: string) {
    return this.prisma.readingHistory.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async clearAllHistory(userId: string) {
    return this.prisma.readingHistory.deleteMany({
      where: { userId },
    });
  }
}
