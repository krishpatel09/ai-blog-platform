import {
  Inject,
  Logger,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../auth/services/audit.service';
import { TokenService } from '../auth/services/token.service';
import { EmailService } from '../auth/services/email.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private redisService: RedisService,
  ) {}

  //Get user profile
  async getProfile(userId: string) {
    const cacheKey = `user_profile:${userId}`;
    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        security: {
          select: {
            emailVerified: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      emailVerified: user.security?.emailVerified || false,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    await this.redisService.set(cacheKey, userData);
    return userData;
  }

  // Get public profile by username
  async getPublicProfileByUsername(username: string) {
    const cacheKey = `user_public_profile:${username}`;
    const cachedUser = await this.redisService.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        email: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisService.set(cacheKey, user);
    return user;
  }

  //Update profile
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const updateData: {
      username?: string;
      email?: string;
      name?: string;
      bio?: string;
      avatar?: string;
      pronouns?: string;
    } = {};

    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          bio: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          security: {
            select: {
              emailVerified: true,
            },
          },
        },
      });

      const userData = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        emailVerified: updatedUser.security?.emailVerified || false,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
      };

      // Invalidate caches
      await this.redisService.del(`user_profile:${userId}`);
      if (updatedUser.username) {
        await this.redisService.del(
          `user_public_profile:${updatedUser.username}`,
        );
      }

      return userData;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Username already used.');
      }
      throw error;
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { security: true },
    });

    if (!user || !user.security) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.security.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.userSecurity.update({
      where: { userId: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async getUserActivity(userId: string, limit = 50) {
    return await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { security: true },
    });

    if (!user || !user.security) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    const { token, expiresAt } =
      this.tokenService.generateEmailVerificationToken();

    await this.prisma.userSecurity.update({
      where: { userId: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt,
      },
    });

    await this.emailService
      .sendPasswordResetEmail(user.email, user.username, token)
      .catch((err) => console.error('Password reset email failed:', err));

    // Log audit event
    await this.auditService.log({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { token, password, confirmPassword } = dto;

    const userSecurity = await this.prisma.userSecurity.findFirst({
      where: { emailVerificationToken: token },
      include: { user: true },
    });

    if (!userSecurity || !userSecurity.user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const now = new Date();
    if (userSecurity.resetExpires && now > userSecurity.resetExpires) {
      throw new BadRequestException(
        'Reset token has expired. Please request a new one.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.userSecurity.update({
      where: { id: userSecurity.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    await this.auditService.log({
      userId: userSecurity.user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      success: true,
      message: 'Password has been reset successfully.',
    };
  }
}
