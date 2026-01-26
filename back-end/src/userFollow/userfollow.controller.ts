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

@Controller('users')
export class UserFollowController {
  constructor(private readonly followService: UserFollowService) {}

  // Toggle Follow/Unfollow
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
    return this.followService.isFollowing(req.user.id, targetId);
  }

  // Get Follow Stats
  @Get('profile/:username/stats')
  async getFollowStats(@Param('username') username: string) {
    return this.followService.getFollowStats(username);
  }

  // Get Followers
  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId);
  }

  // Get Following
  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(userId);
  }
}
