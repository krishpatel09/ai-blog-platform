import {
  Controller,
  Post,
  Param,
  Get,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserFollowService } from './userfollow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('users')
export class UserFollowController {
  constructor(private readonly followService: UserFollowService) {}

  @UseGuards(JwtAuthGuard)
  @Post('follow/:id')
  async handleToggleFollow(@Param('id') targetId: string, @Req() req: any) {
    const currentUserId = req.user.id;
    if (!currentUserId) {
      throw new BadRequestException('User ID not found in request');
    }
    return this.followService.toggleFollow(currentUserId, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('is-following/:targetId')
  async checkIsFollowing(@Param('targetId') targetId: string, @Req() req: any) {
    const currentUserId = req.user.id;
    if (!currentUserId) {
      throw new BadRequestException('User ID not found in request');
    }
    return this.followService.isFollowing(currentUserId, targetId);
  }

  @Public()
  @Get('profile/:username/stats')
  async getFollowStats(@Param('username') username: string) {
    return this.followService.getFollowStats(username);
  }
  @Public()
  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId);
  }

  @Public()
  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(userId);
  }
}
