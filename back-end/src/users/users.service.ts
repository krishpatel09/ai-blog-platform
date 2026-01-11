import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../auth/services/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
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
}
