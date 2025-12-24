import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
// import { CacheService } from '../cache/cache.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

const MAX_LOGIN_ATTEMPTS = 4;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async signin(signinDto: SigninDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = signinDto;

    try {
      const user = await this.prisma.user.findFirst({
        where: { email },
      });

      if (!user) {
        await this.auditService.log({
          action: 'LOGIN_FAILED',
          ipAddress: ipAddress ?? '',
          userAgent: userAgent ?? '',
          details: `Failed login attempt for ${email}`,
          success: false,
        });
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingTime = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / 60000,
        );
        throw new UnauthorizedException(
          `Account is locked. Try again in ${remainingTime} minutes.`,
        );
      }

      // Check if account is active
      if (!user.isActive) {
        throw new UnauthorizedException(
          'Account has been deactivated. Please contact support.',
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Increment failed login attempts
        const loginAttempts = user.loginAttempts + 1;
        const updateData: {
          loginAttempts: number;
          lockedUntil?: Date;
        } = { loginAttempts };

        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          updateData.lockedUntil = new Date(Date.now() + LOCK_TIME);
        }

        // Update user with failed attempt
        await this.prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        // Log failed attempt
        await this.auditService.log({
          userId: user.id,
          action: 'LOGIN_FAILED',
          ipAddress,
          userAgent,
          details: `Failed login attempt ${loginAttempts}/${MAX_LOGIN_ATTEMPTS}`,
          success: false,
        });

        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          throw new UnauthorizedException(
            'Too many failed login attempts. Account locked for 15 minutes.',
          );
        }

        throw new UnauthorizedException('Invalid email or password');
      }

      // Reset login attempts and update last login on successful login
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress ?? '',
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
        ipAddress,
        userAgent,
      );

      // Log successful login
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN',
        ipAddress,
        userAgent,
        success: true,
      });

      // Clean up expired tokens (async, don't wait)
      this.tokenService.cleanupExpiredTokens().catch(console.error);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
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

  async signup(signupDto: SignupDto, ipAddress?: string, userAgent?: string) {
    const { username, email, password } = signupDto;

    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate email verification token
      const emailVerificationToken =
        this.tokenService.generateEmailVerificationToken();

      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          emailVerificationToken,
        },
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
        },
      });

      //send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        user.username,
        emailVerificationToken,
      );

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      const refreshToken = await this.tokenService.generateRefreshToken(
        user.id,
        ipAddress,
        userAgent,
      );

      // Log signup
      await this.auditService.log({
        userId: user.id,
        action: 'SIGNUP',
        ipAddress,
        userAgent,
        success: true,
      });

      // Clean up expired tokens (async, don't wait)
      this.tokenService.cleanupExpiredTokens().catch(console.error);

      return {
        accessToken,
        refreshToken,
        user,
        message:
          'Signup successful. Please check your email to verify your account.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async logout(
    refreshToken: string,
    accessToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    try {
      // Validate and get refresh token
      const refreshTokenRecord =
        await this.tokenService.validateRefreshToken(refreshToken);

      // Blacklist access token if provided
      if (accessToken) {
        await this.tokenService.blacklistAccessToken(
          accessToken,
          refreshTokenRecord.userId,
          900, // 15 min TTL
        );
      }

      // Delete refresh token
      await this.tokenService.deleteRefreshToken(refreshToken);

      // Log logout
      await this.auditService.log({
        userId: refreshTokenRecord.userId,
        action: 'LOGOUT',
        ipAddress,
        userAgent,
        success: true,
      });

      this.tokenService.cleanupExpiredTokens().catch(console.error);

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  async refreshToken(
    dto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      // Validate refresh token
      const oldRefreshToken = await this.tokenService.validateRefreshToken(
        dto.refreshToken,
      );

      // Check if token is revoked
      if (oldRefreshToken.isRevoked) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      // Generate new access token
      const accessToken = this.tokenService.generateAccessToken({
        userId: oldRefreshToken.user.id,
        username: oldRefreshToken.user.username,
        email: oldRefreshToken.user.email,
      });

      // Generate new refresh token
      const newRefreshToken = await this.tokenService.generateRefreshToken(
        oldRefreshToken.user.id,
        ipAddress,
        userAgent,
        oldRefreshToken.id, // Track parent token for reuse detection
      );

      // Mark old token as revoked (don't delete for audit trail)
      await this.prisma.refreshToken.update({
        where: { id: oldRefreshToken.id },
        data: { isRevoked: true, revokedAt: new Date() },
      });

      // Log token refresh
      await this.auditService.log({
        userId: oldRefreshToken.user.id,
        action: 'TOKEN_REFRESH',
        ipAddress,
        userAgent,
        success: true,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: oldRefreshToken.user.id,
          username: oldRefreshToken.user.username,
          email: oldRefreshToken.user.email,
          emailVerified: oldRefreshToken.user.emailVerified,
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

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      success: true,
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If the email exists, a verification email has been sent.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new token
    const emailVerificationToken =
      this.tokenService.generateEmailVerificationToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.username,
      emailVerificationToken,
    );

    return { message: 'Verification email sent successfully' };
  }
}
