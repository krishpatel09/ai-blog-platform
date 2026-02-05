import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
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

  @Post('import')
  async importStory(@Body() body: { url: string }) {
    return this.storiesService.importOnly(body.url);
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

  @Get(':id')
  async getStoryById(@Req() req, @Param('id') id: string) {
    return this.storiesService.findById(id, req.user.id);
  }

  @Put(':id')
  async updateStory(
    @Req() req,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.storiesService.update(id, req.user.id, updateData);
  }
}
