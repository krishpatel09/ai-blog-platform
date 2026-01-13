import {
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

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private tokenService: TokenService,
    private emailService: EmailService,
  ) { }

  // Get user profile
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
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

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.security?.emailVerified || false,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  //Update profile
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const updateData: { username?: string; email?: string } = {};

    if (dto.username !== undefined) {
      updateData.username = dto.username;
    }

    if (dto.email !== undefined) {
      updateData.email = dto.email;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        security: {
          select: {
            emailVerified: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      emailVerified: updatedUser.security?.emailVerified || false,
    };
  }

  //Change password
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

  // Forgot password - send reset email
  async forgotPassword(dto: ForgotPasswordDto, ipAddress?: string, userAgent?: string) {
    const { email } = dto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { security: true },
    });

    // Always return success message for security (don't reveal if email exists)
    if (!user || !user.security) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    // const { token, expiresAt } = this.tokenService.generatePasswordResetToken();
    //check this token and use the generate toen
    // Update user security with reset token
    await this.prisma.userSecurity.update({
      where: { userId: user.id },
      data: {
        resetToken: token,
        resetExpires: expiresAt,
      },
    });

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      token,
    ).catch(err => console.error('Password reset email failed:', err));

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

  // Reset password with token
  async resetPassword(dto: ResetPasswordDto, ipAddress?: string, userAgent?: string) {
    const { token, password, confirmPassword } = dto;

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user by reset token
    const userSecurity = await this.prisma.userSecurity.findFirst({
      where: { resetToken: token },
      include: { user: true },
    });

    if (!userSecurity || !userSecurity.user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    const now = new Date();
    if (userSecurity.resetExpires && now > userSecurity.resetExpires) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await this.prisma.userSecurity.update({
      where: { id: userSecurity.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    });

    // Log audit event
    await this.auditService.log({
      userId: userSecurity.user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
