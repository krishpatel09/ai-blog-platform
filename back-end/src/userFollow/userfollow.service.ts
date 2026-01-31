import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserFollowService {
  private readonly logger = new Logger(UserFollowService.name);

  constructor(private prisma: PrismaService) {}

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
    return this.prisma.userFollow.findMany({
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
  }

  async getFollowing(userId: string) {
    return this.prisma.userFollow.findMany({
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
  }

  async getFollowStats(username: string) {
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

    return {
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
    };
  }

  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    return { isFollowing: !!follow };
  }
}
