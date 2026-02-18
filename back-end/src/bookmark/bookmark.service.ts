import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkListDto } from './dto/create-list.dto';
import { AddBookmarkItemDto } from './dto/add-item.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async ensureDefaultListExists(userId: string) {
    return this.prisma.bookmarkList.upsert({
      where: { userId_name: { userId, name: 'Reading List' } },
      update: {},
      create: {
        name: 'Reading List',
        userId,
        isPrivate: true,
      },
    });
  }

  private getCommonIncludes() {
    return {
      _count: { select: { items: true } },
      items: {
        orderBy: { order: 'asc' as const },
        include: {
          post: { select: { id: true, slug: true, coverImage: true } },
        },
      },
    };
  }

  //create list
  async createList(
    userId: string,
    createBookmarkListDto: CreateBookmarkListDto,
  ) {
    const { name, isPrivate } = createBookmarkListDto;

    const existing = await this.prisma.bookmarkList.findUnique({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
    });

    if (existing) {
      throw new ConflictException('List with this name already exists');
    }
    console.log('Creating list for user:', name);

    const result = await this.prisma.bookmarkList.create({
      data: {
        userId,
        name,
        isPrivate: isPrivate ?? false,
      },
    });

    await this.redisService.del(`user_bookmark_lists:${userId}`);
    return result;
  }

  //get lists
  async getLists(userId: string) {
    const cacheKey = `user_bookmark_lists:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    await this.ensureDefaultListExists(userId);

    const lists = await this.prisma.bookmarkList.findMany({
      where: { userId },
      include: this.getCommonIncludes(),
      orderBy: { createdAt: 'asc' },
    });

    await this.redisService.set(cacheKey, lists);
    return lists;
  }

  // Get public lists by username
  async findPublicListsByUsername(username: string, currentUserId?: string) {
    console.log('Finding public lists for user:', username);

    // We only cache if it's purely public access (no currentUserId or currentUserId != target).
    // If currentUserId is passed and matches, it's essentially my lists, which is covered by getLists logic usually,
    // but this method is specific.
    // Let's cache the public view broadly. `currentUserId` is mainly for "isOwner" check (to show private).
    // If isOwner is true, we should probably not use the public cache or have a specific "owner" cache.
    // Simpler: Cache the public lists for the username. Invalidating it when that user updates lists.

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isOwner = currentUserId === user.id;

    if (!isOwner) {
      const cacheKey = `user_public_bookmark_lists:${username}`;
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;

      const lists = await this.prisma.bookmarkList.findMany({
        where: { userId: user.id, isPrivate: false },
        include: this.getCommonIncludes(),
        orderBy: { createdAt: 'desc' },
      });

      await this.redisService.set(cacheKey, lists, 60 * 1000);
      return lists;
    }

    return this.prisma.bookmarkList.findMany({
      where: { userId: user.id },
      include: this.getCommonIncludes(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getListDetails(userId: string, listId: string) {
    const cacheKey = `bookmark_list_details:${listId}:${userId}`; // userId needed to verify owner/access potentially, but id is unique.
    // Wait, getListDetails checks `userId` in `where` clause, so it implies only owner can see?
    // Or is this for public viewing too? The service method signature takes `userId`.
    // Looking at the code: `where: { id: listId, userId },`. This enforces ownership!
    // So this is "Get My List Details".

    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                publishedAt: true,
                readTime: true,
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
        },
      },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    await this.redisService.set(cacheKey, list, 60 * 1000);
    return list;
  }

  async updateList(
    userId: string,
    listId: string,
    updateListDto: { name?: string; isPrivate?: boolean },
  ) {
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    const result = await this.prisma.bookmarkList.update({
      where: { id: listId },
      data: {
        ...(updateListDto.name && { name: updateListDto.name }),
        ...(updateListDto.isPrivate !== undefined && {
          isPrivate: updateListDto.isPrivate,
        }),
      },
      include: { user: { select: { username: true } } },
    });

    await Promise.all([
      this.redisService.del(`user_bookmark_lists:${userId}`),
      this.redisService.del(`bookmark_list_details:${listId}:${userId}`),
      this.redisService.del(
        `user_public_bookmark_lists:${result.user.username}`,
      ),
    ]);

    return result;
  }

  async deleteList(userId: string, listId: string) {
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
      include: { user: { select: { username: true } } },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    if (list.name === 'Reading List') {
      // Prevent deleting the default reading list if desired, or allow it.
      // Usually default lists are protected.
      throw new ConflictException('Cannot delete the default Reading List');
    }

    const result = await this.prisma.bookmarkList.delete({
      where: { id: listId },
    });

    await Promise.all([
      this.redisService.del(`user_bookmark_lists:${userId}`),
      this.redisService.del(`bookmark_list_details:${listId}:${userId}`),
      this.redisService.del(`user_public_bookmark_lists:${list.user.username}`),
    ]);

    return result;
  }

  async addItem(
    userId: string,
    listId: string,
    addItemDto: AddBookmarkItemDto,
  ) {
    // Verify list ownership
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
      include: {
        items: {
          orderBy: { order: 'desc' },
          take: 1,
        },
        user: { select: { username: true } },
      },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    // Check if item exists
    const existing = await this.prisma.bookmarkItem.findUnique({
      where: {
        listId_postId: {
          listId,
          postId: addItemDto.postId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Post already in this list');
    }

    // Calculate next order
    const nextOrder = list.items.length > 0 ? list.items[0].order + 1 : 0;

    const result = await this.prisma.bookmarkItem.create({
      data: {
        listId,
        postId: addItemDto.postId,
        order: nextOrder,
      },
    });

    await Promise.all([
      this.redisService.del(`user_bookmark_lists:${userId}`),
      this.redisService.del(`bookmark_list_details:${listId}:${userId}`),
      this.redisService.del(`user_public_bookmark_lists:${list.user.username}`),
    ]);

    return result;
  }

  async removeItem(userId: string, listId: string, postId: string) {
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
      include: { user: { select: { username: true } } },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    try {
      const result = await this.prisma.bookmarkItem.delete({
        where: {
          listId_postId: {
            listId,
            postId,
          },
        },
      });

      await Promise.all([
        this.redisService.del(`user_bookmark_lists:${userId}`),
        this.redisService.del(`bookmark_list_details:${listId}:${userId}`),
        this.redisService.del(
          `user_public_bookmark_lists:${list.user.username}`,
        ),
      ]);

      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Bookmark item not found in this list');
      }
      throw error;
    }
  }

  async reorderItems(userId: string, listId: string, postIds: string[]) {
    // Verify list ownership
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
      include: { user: { select: { username: true } } },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    // Use transaction to update all items
    const updates = postIds.map((postId, index) =>
      this.prisma.bookmarkItem.update({
        where: {
          listId_postId: {
            listId,
            postId,
          },
        },
        data: {
          order: index,
        },
      }),
    );

    const result = await this.prisma.$transaction(updates);

    await Promise.all([
      this.redisService.del(`user_bookmark_lists:${userId}`),
      this.redisService.del(`bookmark_list_details:${listId}:${userId}`),
      this.redisService.del(`user_public_bookmark_lists:${list.user.username}`),
    ]);

    return result;
  }
}
