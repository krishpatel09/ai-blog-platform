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
import { NotificationService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private prisma: PrismaService,
    private slugService: SlugService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
  ) {}

  async testRedisConnection() {
    await this.redisService.set('test_hello', 'Hello from Redis', 60000);
    const value = await this.redisService.get('test_hello');
    return { message: value, cached: true };
  }

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

      if (status === 'PUBLISHED') {
        const followers = await this.prisma.userFollow.findMany({
          where: { followingId: userId },
          select: { followerId: true },
        });

        await Promise.all(
          followers.map((follower) =>
            this.notificationService.createAndSend({
              recipientId: follower.followerId,
              actorId: userId,
              type: NotificationType.NEW_POST,
              title: 'New Post',
              message: `${post.user.name} published a new post: ${post.title}`,
              postId: post.id,
            }),
          ),
        );
      }

      // Invalidate caches
      await this.redisService.del('all_published_posts');
      await this.redisService.del(`user_posts:${userId}`);
      // Invalidate username_posts? We have username from post.user? No, we have userId.
      // We can fetch user to get username or just rely on TTL for that specific list if getting username is costly.
      // But creating a post is rare enough.
      // Let's assume we want to be correct.
      // Since we already might have fetched user or know it?
      // The `create` method doesn't fetch `user.username` explicitly for the `post` object returned?
      // Wait, `include: { user: ... }` IS THERE.
      if (post.user && post.user.username) {
        await this.redisService.del(`username_posts:${post.user.username}`);
      }

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

    const scheduledPosts = await this.prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        publishedAt: {
          lte: now,
        },
      },
      select: { id: true },
    });

    if (scheduledPosts.length === 0) return;

    const scheduledPostIds = scheduledPosts.map((p) => p.id);

    const result = await this.prisma.post.updateMany({
      where: {
        id: { in: scheduledPostIds },
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
    const cacheKey = 'all_published_posts';
    const cachedPosts = await this.redisService.get(cacheKey);

    if (cachedPosts) {
      console.log('Returning from Cache');
      return cachedPosts;
    }

    console.log('Fetching from DB');
    const posts = await this.prisma.post.findMany({
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

    await this.redisService.set(cacheKey, posts);
    return posts;
  }

  async findUserPosts(userId: string) {
    const cacheKey = `user_posts:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const posts = await this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    await this.redisService.set(cacheKey, posts);
    return posts;
  }

  async findPostsByUsername(username: string) {
    const cacheKey = `username_posts:${username}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const posts = await this.prisma.post.findMany({
      where: {
        userId: user.id,
        status: 'PUBLISHED',
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        user: { select: { name: true, avatar: true, username: true } },
      },
    });

    await this.redisService.set(cacheKey, posts);
    return posts;
  }

  async findBySlug(slug: string) {
    const cacheKey = `post_slug:${slug}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

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
      throw new NotFoundException('Post not found');
    }

    const isFuture = post.publishedAt && post.publishedAt > new Date();
    if (post.status !== 'PUBLISHED' || isFuture) {
      throw new NotFoundException('Post not found');
    }

    await this.redisService.set(cacheKey, post, 60 * 1000);
    return post;
  }

  async likePost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { user: { select: { username: true } } },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const result = await this.prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: { increment: 1 },
      },
    });

    // Invalidate caches
    await Promise.all([
      this.redisService.del('all_published_posts'),
      this.redisService.del(`post_slug:${post.slug}`),
      this.redisService.del(`user_posts:${post.userId}`),
      this.redisService.del(`username_posts:${post.user.username}`),
    ]);

    return result;
  }
}
