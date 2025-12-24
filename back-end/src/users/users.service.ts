import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
   constructor(private prisma: PrismaService) {}
  
    // 🔹 Get user profile
    async getProfile(userId: number) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
        },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return user;
    }
  
    // 🔹 Update profile
    async updateProfile(userId: number, dto: UpdateUserDto) {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          username: dto.username,
          email: dto.email,
        },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
        },
      });
    }
  
    // 🔹 Change password
    async changePassword(userId: number, dto: ChangePasswordDto) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const isPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );
  
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
  
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
  
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });
  
      return { message: 'Password changed successfully' };
    }
  }
  