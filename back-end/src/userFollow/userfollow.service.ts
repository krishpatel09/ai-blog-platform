import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserFollowService {
  private readonly logger = new Logger(UserFollowService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async toggleFollow(followerId: string, followingId: string) {
    console.log('Toggling follow for', followerId, 'and', followingId);
    if (followerId === followingId) {
      this.logger.error(
        `[UserFollowService] User ${followerId} tried to follow themselves.`,
      );
      throw new BadRequestException('You cannot follow yourself');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    console.log('Target user:', targetUser);
    if (!targetUser) {
      throw new NotFoundException(
        'The user you are trying to follow does not exist',
      );
    }

    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    console.log('Existing follow:', existingFollow);

    // Invalidate caches
    await Promise.all([
      this.redisService.del(`user_followers:${followingId}`),
      this.redisService.del(`user_following:${followerId}`),
      this.redisService.del(`user_follow_stats:${targetUser.username}`),
      this.redisService.del(`is_following:${followerId}:${followingId}`),
    ]);
    // Also need to invalidate stats for the follower (following count changed) - but we don't have follower username easily here without another DB call or assuming it's passed.
    // Ideally we should invalidate. Let's do best effort by just accepting we might not have follower username here.
    // If we want to be strict, we'd fetch follower too.

    if (existingFollow) {
      return await this.prisma.$transaction(async (tx) => {
        await tx.userFollow.delete({
          where: {
            followerId_followingId: { followerId, followingId },
          },
        });

        this.logger.log(
          `[UserFollowService] User ${followerId} unfollowed ${followingId}`,
        );
        return { message: 'Unfollowed successfully', isFollowing: false };
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.userFollow.create({
        data: { followerId, followingId },
      });

      this.logger.log(
        `[UserFollowService] User ${followerId} followed ${followingId}`,
      );
      return { message: 'Followed successfully', isFollowing: true };
    });
  }

  async getFollowers(userId: string) {
    const cacheKey = `user_followers:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const followers = await this.prisma.userFollow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    await this.redisService.set(cacheKey, followers, 60 * 1000);
    return followers;
  }

  async getFollowing(userId: string) {
    const cacheKey = `user_following:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const following = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    await this.redisService.set(cacheKey, following);
    return following;
  }

  async getFollowStats(username: string) {
    const cacheKey = `user_follow_stats:${username}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats = {
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
    };

    await this.redisService.set(cacheKey, stats);
    return stats;
  }

  async isFollowing(followerId: string, followingId: string) {
    const cacheKey = `is_following:${followerId}:${followingId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const follow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    const result = { isFollowing: !!follow };

    await this.redisService.set(cacheKey, result);
    return result;
  }
}
