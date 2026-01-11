import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import {
  CurrentUser,
  type CurrentUserType,
} from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';


@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  getProfile(@CurrentUser() user: CurrentUserType) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('update-profile')
  updateProfile(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Patch('change-password')
  changePassword(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.userId, dto);
  }

  //this is importtant api check history of user
  @Get('my-activity')
  @UseGuards(JwtAuthGuard)
  async getMyActivity(@CurrentUser() user: CurrentUserType) {
    return this.usersService.getUserActivity(user.userId);
  }

  // @Get('activity')
  // @ApiOperation({ summary: 'Get current user activity logs' })
  // @ApiResponse({ status: 200, description: 'Return activity log list' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async getActivity(@CurrentUser() user: CurrentUser) {
  //   return this.usersService.getUserActivity(user.userId);
}
