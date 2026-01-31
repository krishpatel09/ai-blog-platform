import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('blog')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('create')
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.blogService.create(req.user.id, createPostDto);
  }

  @Get('live')
  findAllLive() {
    return this.blogService.findAllLive();
  }

  @Get('my-posts')
  getMyPosts(@Request() req) {
    return this.blogService.findUserPosts(req.user.userId);
  }

  @Public()
  @Get('user/@:username')
  getUserPosts(@Param('username') username: string) {
    return this.blogService.findPostsByUsername(username);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Patch(':id/like')
  likePost(@Param('id') id: string) {
    return this.blogService.likePost(id);
  }
}
