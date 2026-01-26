import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    const userId = req.user.id;
    return this.commentService.createComment(userId, createCommentDto);
  }

  @Get('post/:postId')
  async getPostComments(@Param('postId') postId: string) {
    return this.commentService.getPostComments(postId);
  }

  @Get('replies/:id')
  async getReplies(@Param('id') commentId: string) {
    return this.commentService.getReplies(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteComment(@Param('id') commentId: string, @Req() req) {
    const userId = req.user.id;
    return this.commentService.deleteComment(userId, commentId);
  }
}
