import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class SlugService {
  constructor(private readonly prisma: PrismaService) {}

  async generateUniqueSlug(title: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    let counter = 1;
    const baseSlug = slug;

    while (true) {
      const existingPost = await this.prisma.post.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existingPost) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
