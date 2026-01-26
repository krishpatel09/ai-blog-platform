import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    const { postId, content, parentId } = createCommentDto;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Verify Post Exists
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

      // 3. Create the Comment
      const comment = await tx.comment.create({
        data: {
          content,
          userId,
          postId,
          parentId: parentId || null,
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

      // 4. Increment Post Comment Count
      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'COMMENT_CREATE',
          details: {
            commentId: comment.id,
            postId,
            parentId: parentId || null,
          },
        },
      });

      return comment;
    });
  }

  /**
   * Get top-level comments for a post
   * - Includes user details
   * - Includes reply count
   */
  async getPostComments(postId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  }

  /**
   * Get replies for a specific comment
   * - Includes user details
   * - Includes nested reply count (if we support deep nesting fetch later, but for now strict direct children)
   */
  async getReplies(commentId: string) {
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
      },
      orderBy: {
        createdAt: 'asc', // Replies usually chronological
      },
    });

    return replies;
  }

  /**
   * Delete a comment
   * - Only owner can delete (Controller should enforce current user match)
   * - Decrement post comment count
   */
  async deleteComment(userId: string, commentId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        include: {
          _count: {
            select: { replies: true }, // This defaults to direct replies only
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

      // Decrease count by 1 (The main comment) - *Logic simplification*
      // Real-world: Should count children.
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
}
