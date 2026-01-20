import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.blogService.create(req.user.id, createPostDto);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }
}
