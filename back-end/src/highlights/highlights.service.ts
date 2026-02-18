import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HighlightsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async create(
    userId: string,
    data: { postId: string; content: string; quote?: string },
  ) {
    const result = await this.prisma.highlight.create({
      data: {
        userId,
        postId: data.postId,
        content: data.content,
        quote: data.quote,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    await this.redisService.del(`user_highlights:${userId}`);
    return result;
  }

  async findAllByUser(userId: string) {
    const cacheKey = `user_highlights:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const highlights = await this.prisma.highlight.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.redisService.set(cacheKey, highlights);
    return highlights;
  }

  async delete(userId: string, id: string) {
    const highlight = await this.prisma.highlight.findUnique({
      where: { id },
    });

    if (!highlight || highlight.userId !== userId) {
      throw new NotFoundException('Highlight not found');
    }

    const result = await this.prisma.highlight.delete({
      where: { id },
    });

    await this.redisService.del(`user_highlights:${userId}`);
    return result;
  }
}
