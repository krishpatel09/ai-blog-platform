import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    return this.prisma.tag.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
