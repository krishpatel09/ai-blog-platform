import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HighlightsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: { postId: string; content: string; quote?: string },
  ) {
    return this.prisma.highlight.create({
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
  }

  async findAllByUser(userId: string) {
    return this.prisma.highlight.findMany({
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
  }

  async delete(userId: string, id: string) {
    const highlight = await this.prisma.highlight.findUnique({
      where: { id },
    });

    if (!highlight || highlight.userId !== userId) {
      throw new NotFoundException('Highlight not found');
    }

    return this.prisma.highlight.delete({
      where: { id },
    });
  }
}
