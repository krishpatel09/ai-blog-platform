import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import slugify from 'slugify';
import { SlugService } from './service/slug.service';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private prisma: PrismaService,
    private slugService: SlugService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const { title, content, tags, coverImage, publishedAt, status } =
      createPostDto;
    console.log('createPostDto', createPostDto);

    let slug = await this.slugService.generateUniqueSlug(title);
    if (!slug) {
      throw new BadRequestException('Failed to generate unique slug');
    }

    const finalPublishDate = publishedAt ? new Date(publishedAt) : new Date();

    try {
      const post = await this.prisma.post.create({
        data: {
          title,
          slug,
          content,
          coverImage,
          publishedAt: finalPublishDate,
          status,
          userId,
          tags:
            tags && tags.length > 0
              ? Array.from(new Set(tags.map((t) => t.toLowerCase())))
              : [],
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
      console.log('success');
      return post;
    } catch (error) {
      throw new BadRequestException(`Failed to create post: ${error.message}`);
    }
  }

  // Task 3: Automated Status Transition
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    this.logger.log('Running Cron Job: Checking for scheduled posts...');
    const now = new Date();

    const result = await this.prisma.post.updateMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now,
        },
      },
      data: {
        status: 'PUBLISHED',
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Cron Job Executed: Successfully published ${result.count} scheduled posts.`,
      );
    } else {
      // Optional: don't spam logs if nothing happened, or log verbose
      // this.logger.debug('No scheduled posts to publish.');
    }
  }

  async findAllLive() {
    return this.prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date(),
        },
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        user: { select: { name: true, avatar: true, username: true } },
      },
    });
  }

  async findUserPosts(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPostsByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.post.findMany({
      where: {
        userId: user.id,
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        user: { select: { name: true, avatar: true, username: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    console.log('slug', slug);
    const post = await this.prisma.post.findUnique({
      where: { slug },
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

    if (!post) {
      console.log('Post not found in DB for slug:', slug);
      throw new NotFoundException('Post not found');
    }

    const isFuture = post.publishedAt && post.publishedAt > new Date();
    if (post.status !== 'PUBLISHED' || isFuture) {
      console.log('Post not published or scheduled for future:', {
        status: post.status,
        publishedAt: post.publishedAt,
      });
      throw new NotFoundException('Post not found');
    }
    console.log('post', post);
    return post;
  }

  async likePost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: { increment: 1 },
      },
    });
  }
}
