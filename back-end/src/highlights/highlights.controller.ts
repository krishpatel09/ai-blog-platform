import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HighlightsService } from './highlights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('highlights')
@UseGuards(JwtAuthGuard)
export class HighlightsController {
  constructor(private readonly highlightsService: HighlightsService) {}

  @Post()
  create(
    @Request() req,
    @Body() body: { postId: string; content: string; quote?: string },
  ) {
    return this.highlightsService.create(req.user.id, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.highlightsService.findAllByUser(req.user.id);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.highlightsService.delete(req.user.id, id);
  }
}
