import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class SlugService {
  constructor(private readonly prisma: PrismaService) {}

  async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });

    const unique = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    console.log('unique', `${base}-${unique}`);
    return `${base}-${unique}`;
  }
}
