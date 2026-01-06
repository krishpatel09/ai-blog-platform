import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import {
  CurrentUser,
  type CurrentUserType,
} from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔹 Get logged-in user profile
  @Get('me')
  getProfile(@CurrentUser() user: CurrentUserType) {
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.getProfile(user.id);
  }

  // 🔹 Update user profile
  @Patch('me')
  updateProfile(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateUserDto,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.updateProfile(user.id, dto);
  }

  // 🔹 Change password
  @Patch('change-password')
  changePassword(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: ChangePasswordDto,
  ) {
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.changePassword(user.id, dto);
  }
}
