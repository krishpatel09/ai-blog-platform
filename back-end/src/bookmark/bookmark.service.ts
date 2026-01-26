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

  // Helper to ensure "Reading List" exists for a user
  // We can call this lazily when user tries to access lists or add to default list
  async ensureDefaultListExists(userId: string) {
    const defaultList = await this.prisma.bookmarkList.findUnique({
      where: {
        userId_name: {
          userId,
          name: 'Reading List',
        },
      },
    });

    if (!defaultList) {
      return this.prisma.bookmarkList.create({
        data: {
          name: 'Reading List',
          userId,
        },
      });
    }

    return defaultList;
  }

  //create list
  async createList(
    userId: string,
    createBookmarkListDto: CreateBookmarkListDto,
  ) {
    const { name } = createBookmarkListDto;

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
      },
    });
  }

  //get lists
  async getLists(userId: string) {
    await this.ensureDefaultListExists(userId);

    const lists = await this.prisma.bookmarkList.findMany({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            post: {
              select: {
                id: true,
                slug: true,
                coverImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return lists;
  }

  // Get public lists by username
  async findPublicListsByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // For now assuming all lists are public or we filter by visibility if implemented
    // The previous mockup showed "Private" badge, implying visibility exists.
    // Checking schema... Schema doesn't have visibility field on BookmarkList.
    // So distinct public/private logic might not exist in backend yet.
    // Returning all lists for now as requested "Display all lists for the user".
    // Ideally we'd add visibility field.

    return this.prisma.bookmarkList.findMany({
      where: { userId: user.id }, // Add visibility filter here later
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          orderBy: { createdAt: 'desc' },
          take: 4, // Preview items
          include: {
            post: {
              select: {
                coverImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getListDetails(userId: string, listId: string) {
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
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

  async addItem(
    userId: string,
    listId: string,
    addItemDto: AddBookmarkItemDto,
  ) {
    // Verify list ownership
    const list = await this.prisma.bookmarkList.findUnique({
      where: { id: listId, userId },
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

    // Transaction to add item and update counts if necessary (though count is dynamic)
    return this.prisma.bookmarkItem.create({
      data: {
        listId,
        postId: addItemDto.postId,
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

    // Handling case where item doesn't exist? Prisma delete throws if not found usually or we use deleteMany
    // deleteMany returns count, delete throws
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
}
