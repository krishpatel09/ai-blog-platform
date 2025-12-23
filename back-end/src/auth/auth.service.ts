import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './services/token.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password');
      }

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      const refreshToken = await this.tokenService.generateRefreshToken(
        user.id,
      );

      // Clean up expired tokens (async, don't wait)
      this.tokenService.cleanupExpiredTokens().catch(console.error);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async signup(signupDto: SignupDto) {
    const { username, email, password } = signupDto;

    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      const refreshToken = await this.tokenService.generateRefreshToken(
        user.id,
      );

      // Clean up expired tokens (async, don't wait)
      this.tokenService.cleanupExpiredTokens().catch(console.error);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Find the refresh token in database
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (tokenRecord.expiresAt < new Date()) {
        // Delete expired token
        await this.prisma.refreshToken.delete({
          where: { id: tokenRecord.id },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new access token
      const accessToken = this.tokenService.generateAccessToken({
        userId: tokenRecord.user.id,
        username: tokenRecord.user.username,
        email: tokenRecord.user.email,
      });

      // Rotate refresh token (create new first, then delete old for atomicity)
      const newRefreshToken = await this.tokenService.generateRefreshToken(
        tokenRecord.user.id,
      );

      // Delete old refresh token after new one is created
      await this.prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: tokenRecord.user.id,
          username: tokenRecord.user.username,
          email: tokenRecord.user.email,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.tokenService.deleteRefreshToken(refreshToken);

      this.tokenService.cleanupExpiredTokens().catch(console.error);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
