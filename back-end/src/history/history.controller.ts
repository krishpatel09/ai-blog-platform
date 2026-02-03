import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('track/:postId')
  async trackPost(@Req() req, @Param('postId') postId: string) {
    return this.historyService.upsertHistory(req.user.id, postId);
  }

  @Patch('progress/:postId')
  async updateProgress(
    @Req() req,
    @Param('postId') postId: string,
    @Body('progress', ParseIntPipe) progress: number,
  ) {
    return this.historyService.updateProgress(req.user.id, postId, progress);
  }

  @Get()
  async getHistory(
    @Req() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.historyService.getUserHistory(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Delete()
  async clearHistory(@Req() req) {
    return this.historyService.clearAllHistory(req.user.id);
  }

  @Delete(':postId')
  async deleteHistoryItem(@Req() req, @Param('postId') postId: string) {
    return this.historyService.deleteHistoryItem(req.user.id, postId);
  }
}
