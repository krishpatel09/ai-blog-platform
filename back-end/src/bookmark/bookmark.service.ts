import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkListDto } from './dto/create-list.dto';
import { AddBookmarkItemDto } from './dto/add-item.dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.bookmarkList.create({
      data: {
        userId,
        name,
        isPrivate: isPrivate ?? false,
      },
    });
  }

  //get lists
  async getLists(userId: string) {
    await this.ensureDefaultListExists(userId);

    return this.prisma.bookmarkList.findMany({
      where: { userId },
      include: this.getCommonIncludes(),
      orderBy: { createdAt: 'asc' },
    });
  }

  // Get public lists by username
  async findPublicListsByUsername(username: string, currentUserId?: string) {
    console.log('Finding public lists for user:', username);
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isOwner = currentUserId === user.id;

    return this.prisma.bookmarkList.findMany({
      where: { userId: user.id, ...(isOwner ? {} : { isPrivate: false }) },
      include: this.getCommonIncludes(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getListDetails(userId: string, listId: string) {
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

    return this.prisma.bookmarkList.update({
      where: { id: listId },
      data: {
        ...(updateListDto.name && { name: updateListDto.name }),
        ...(updateListDto.isPrivate !== undefined && {
          isPrivate: updateListDto.isPrivate,
        }),
      },
    });
  }

  async deleteList(userId: string, listId: string) {
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    if (list.name === 'Reading List') {
      // Prevent deleting the default reading list if desired, or allow it.
      // Usually default lists are protected.
      throw new ConflictException('Cannot delete the default Reading List');
    }

    return this.prisma.bookmarkList.delete({
      where: { id: listId },
    });
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

    return this.prisma.bookmarkItem.create({
      data: {
        listId,
        postId: addItemDto.postId,
        order: nextOrder,
      },
    });
  }

  async removeItem(userId: string, listId: string, postId: string) {
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
    });

    if (!list) {
      throw new NotFoundException('Bookmark list not found');
    }

    try {
      return await this.prisma.bookmarkItem.delete({
        where: {
          listId_postId: {
            listId,
            postId,
          },
        },
      });
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

    return this.prisma.$transaction(updates);
  }
}
