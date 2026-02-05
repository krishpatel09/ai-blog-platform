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
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    const userId = req.user.id;
    return this.commentService.createComment(userId, createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('like/:id')
  async toggleLike(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.commentService.toggleCommentLike(userId, id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('post/:postId')
  async getPostComments(@Param('postId') postId: string, @Req() req) {
    const userId = req.user?.id;
    return this.commentService.getPostComments(userId, postId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('replies/:id')
  async getReplies(@Param('id') commentId: string, @Req() req) {
    const userId = req.user?.id;
    return this.commentService.getReplies(userId, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteComment(@Param('id') commentId: string, @Req() req) {
    const userId = req.user.id;
    return this.commentService.deleteComment(userId, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-responses')
  async getMyResponses(@Req() req) {
    const userId = req.user.id;
    return this.commentService.getUserResponses(userId);
  }
}
