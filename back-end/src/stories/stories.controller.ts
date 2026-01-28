import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get('stats')
  async getStats(@Req() req) {
    return this.storiesService.getStats(req.user.id);
  }

  @Get()
  async getStories(
    @Req() req,
    @Query('status') status: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.storiesService.findAll(
      req.user.id,
      status,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }
}
