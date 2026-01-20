import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

import slugify from 'slugify';
import { SlugService } from './service/slug.service';

@Injectable()
export class BlogService {
  constructor(
    private prisma: PrismaService,
    private slugService: SlugService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const { title, content, tags, coverImage, publishedAt } = createPostDto;

    console.log('postdto', userId);
    console.log('postdto', createPostDto);

    const slug = await this.slugService.generateUniqueSlug(title);

    try {
      const post = await this.prisma.post.create({
        data: {
          title,
          slug,
          content,
          coverImage,
          publishedAt: publishedAt ? new Date(publishedAt) : undefined,
          status: publishedAt ? 'PUBLISHED' : 'DRAFT',
          userId,
          tags:
            tags && tags.length > 0
              ? {
                  create: Array.from(
                    new Set(tags.map((t) => t.toLowerCase())),
                  ).map((normalizedName) => {
                    return {
                      tag: {
                        connectOrCreate: {
                          where: { name: normalizedName },
                          create: {
                            name: normalizedName,
                            slug: slugify(normalizedName, {
                              lower: true,
                              strict: true,
                            }),
                          },
                        },
                      },
                    };
                  }),
                }
              : undefined,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
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

      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new BadRequestException(`Failed to create post: ${error.message}`);
    }
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
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

    return post;
  }
}
