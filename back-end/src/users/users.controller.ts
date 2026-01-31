import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Post,
  Headers,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import {
  CurrentUser,
  type CurrentUserType,
} from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { ClientIp } from '../common/decorators/ip.decorator';

@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: CurrentUserType) {
    return this.usersService.getProfile(user.userId);
  }

  @Public()
  @Get('@:username')
  getPublicProfile(@Param('username') username: string) {
    return this.usersService.getPublicProfileByUsername(username);
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

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.usersService.forgotPassword(dto, ip, userAgent);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @ClientIp() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.usersService.resetPassword(dto, ip, userAgent);
  }

  // @Get('activity')
  // @ApiOperation({ summary: 'Get current user activity logs' })
  // @ApiResponse({ status: 200, description: 'Return activity log list' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async getActivity(@CurrentUser() user: CurrentUser) {
  //   return this.usersService.getUserActivity(user.userId);
}
