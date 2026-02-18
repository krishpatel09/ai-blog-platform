import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
  ) {}

  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    const { postId, content, parentId, selectedText } = createCommentDto;
    console.log('selectedText', selectedText);

    const result = await this.prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      if (parentId) {
        const parentComment = await tx.comment.findUnique({
          where: { id: parentId },
        });

        if (!parentComment) {
          throw new NotFoundException(
            `Parent comment with ID ${parentId} not found`,
          );
        }

        if (parentComment.postId !== postId) {
          throw new BadRequestException(
            'Parent comment does not belong to this post',
          );
        }
      }

      const comment = await tx.comment.create({
        data: {
          content,
          userId,
          postId,
          parentId: parentId || null,
          selectedText: selectedText || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      console.log(
        `[CommentService] User ${userId} commented on Post ${postId}. Comment ID: ${comment.id}`,
      );

      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      return { comment, post };
    });

    // Notify post author if commenter is not the author
    if (result.post.userId !== userId) {
      await this.notificationService.createAndSend({
        recipientId: result.post.userId,
        actorId: userId,
        type: NotificationType.NEW_COMMENT,
        title: 'New Comment',
        message: `${result.comment.user.name} commented on your post`,
        postId: postId,
        commentId: result.comment.id,
      });
    }

    return result.comment;
  }
  async toggleCommentLike(userId: string, commentId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.commentLike.findUnique({
        where: {
          userId_commentId: { userId, commentId },
        },
      });

      if (existingLike) {
        await tx.commentLike.delete({
          where: {
            userId_commentId: { userId, commentId },
          },
        });
        return tx.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        });
      } else {
        await tx.commentLike.create({
          data: {
            userId,
            commentId,
          },
        });
        const result = await tx.comment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } },
        });

        return result;
      }
    });
  }

  async getPostComments(userId: string, postId: string) {
    const cacheKey = `post_comments:${postId}:${userId || 'anon'}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
        likes: userId ? { where: { userId: userId }, take: 1 } : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    await this.redisService.set(cacheKey, comments);
    return comments;
  }

  async getReplies(userId: string, commentId: string) {
    const cacheKey = `comment_replies:${commentId}:${userId || 'anon'}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const replies = await this.prisma.comment.findMany({
      where: {
        parentId: commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
        likes: userId ? { where: { userId: userId }, take: 1 } : false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    await this.redisService.set(cacheKey, replies);
    return replies;
  }

  async deleteComment(userId: string, commentId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        include: {
          _count: {
            select: { replies: true },
          },
        },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new BadRequestException('You can only delete your own comments');
      }

      await tx.comment.delete({
        where: { id: commentId },
      });

      await tx.post.update({
        where: { id: comment.postId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      });

      return { message: 'Comment deleted successfully' };
    });
  }

  async getUserResponses(userId: string) {
    const cacheKey = `user_responses:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const responses = await this.prisma.comment.findMany({
      where: {
        userId,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    await this.redisService.set(cacheKey, responses);
    return responses;
  }
}
