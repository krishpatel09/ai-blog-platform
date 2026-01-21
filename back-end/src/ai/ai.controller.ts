import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-from-image')
  @UseGuards(JwtAuthGuard)
  async generateBlog(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    return this.aiService.generateBlogFromImage(imageUrl);
  }
}
