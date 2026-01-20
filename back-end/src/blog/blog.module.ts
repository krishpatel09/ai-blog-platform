import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { SlugService } from './service/slug.service';
@Module({
  controllers: [BlogController],
  providers: [BlogService, SlugService],
})
export class BlogModule {}
