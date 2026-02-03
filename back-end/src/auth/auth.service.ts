import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { slugifyEmail } from '../utils/username.util';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async signup(signupDto: SignupDto, ipAddress?: string, userAgent?: string) {
    const { name, email, password } = signupDto;
    console.log(signupDto);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    //hash password
    const usernameGenerate = await slugifyEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const { token, expiresAt } =
      this.tokenService.generateEmailVerificationToken();
    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          const user = await tx.user.create({
            data: {
              name,
              username: usernameGenerate,
              email,
              isActive: true,
              security: {
                create: {
                  password: hashedPassword,
                  emailVerified: false,
                  emailVerificationToken: token,
                  emailVerificationExpires: expiresAt,
                },
              },
            },
            include: {
              security: true,
            },
          });
          console.log('User created');
          await tx.auditLog.create({
            data: {
              userId: user.id,
              action: 'SIGNUP',
              ipAddress,
              userAgent,
              success: true,
            },
          });
          console.log('Audit log created');
          return user;
        },
        {
          timeout: 15000,
        },
      );
      console.log('User created after transaction');
      //send verification email
      this.emailService
        .sendVerificationEmail(result.email, result.name, token)
        .catch((err) => console.error('Email sending failed:', err));
      console.log('Verification email sent');

      console.log('Signup successful');
      return {
        success: true,
        message: 'Registration successful. Please verify your email.',
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async signin(signinDto: SigninDto, ipAddress?: string, userAgent?: string) {
    const { email, password, rememberMe } = signinDto;

    console.log('signinDto', signinDto);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { security: true },
      });

      if (
        !user ||
        !user.security ||
        !(await bcrypt.compare(password, user.security.password))
      ) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.security.emailVerified) {
        throw new UnauthorizedException('Email not verified');
      }

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      const { token: refreshToken, expiresInMs } =
        await this.tokenService.generateRefreshToken(user.id, rememberMe);

      // Log successful login
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN',
        ipAddress,
        userAgent,
        success: true,
      });
      return {
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          expiresInMs,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            emailVerified: user.security.emailVerified,
            avatar: user.avatar,
            name: user.name,
          },
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Login Error:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async logout(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string; action: 'LOGOUT' }> {
    try {
      if (refreshToken) {
        await this.tokenService.deleteRefreshToken(refreshToken);
      }

      await this.auditService.log({
        userId,
        action: 'LOGOUT',
        ipAddress,
        userAgent,
        success: true,
      });
    } catch (error) {
      console.error('Logout Error:', error);
      throw new InternalServerErrorException('Internal server error');
    } finally {
      this.tokenService.cleanupExpiredTokens().catch(console.error);
    }
    return {
      success: true,
      message: 'Logged out successfully',
      action: 'LOGOUT',
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const oldRefreshToken = await this.tokenService.validateRefreshToken(
        dto.refreshToken,
      );
      console.log('Old refresh token validated', oldRefreshToken.id);

      const duration =
        oldRefreshToken.expiresAt.getTime() -
        oldRefreshToken.createdAt.getTime();
      const rememberMe = duration > 24 * 60 * 60 * 1000 * 1.5;

      await this.tokenService.deleteRefreshToken(dto.refreshToken);
      const accessToken = this.tokenService.generateAccessToken({
        userId: oldRefreshToken.user.id,
        username: oldRefreshToken.user.username,
        email: oldRefreshToken.user.email,
      });

      // Generate new refresh token
      const { token: refreshToken, expiresInMs } =
        await this.tokenService.generateRefreshToken(
          oldRefreshToken.user.id,
          rememberMe,
        );

      console.log(
        'Token rotated successfully for user:',
        oldRefreshToken.user.id,
      );

      await this.auditService.log({
        userId: oldRefreshToken.user.id,
        action: 'REFRESH_TOKEN',
        success: true,
        details: {
          oldRefreshTokenId: oldRefreshToken.id,
          newRefreshTokenId: refreshToken,
          expiresInMs,
        },
      });

      return {
        message: 'Token refreshed successfully',
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresInMs,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Refresh Token Error:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async verifyEmail(token: string, ipAddress?: string, userAgent?: string) {
    const userSecurity = await this.prisma.userSecurity.findFirst({
      where: { emailVerificationToken: token },
      include: { user: true },
    });

    if (!userSecurity || !userSecurity.user) {
      throw new BadRequestException('Invalid or expired token');
    }
    const now = new Date();
    if (
      userSecurity.emailVerificationExpires &&
      now > userSecurity.emailVerificationExpires
    ) {
      throw new BadRequestException(
        'Verification link has expired. Please request a new one.',
      );
    }

    await this.prisma.userSecurity.update({
      where: { id: userSecurity.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    const accessToken = this.tokenService.generateAccessToken({
      userId: userSecurity.user.id,
      username: userSecurity.user.username,
      email: userSecurity.user.email,
    });

    const { token: refreshToken, expiresInMs } =
      await this.tokenService.generateRefreshToken(userSecurity.user.id, false);

    await this.auditService.log({
      userId: userSecurity.user.id,
      action: 'EMAIL_VERIFIED',
      ipAddress,
      userAgent,
      success: true,
    });
    console.log('Email verified successfully');
    return {
      success: true,
      message: 'Email verified successfully',
      data: {
        accessToken,
        refreshToken,
        expiresInMs,
        user: {
          id: userSecurity.user.id,
          username: userSecurity.user.username,
          email: userSecurity.user.email,
          emailVerified: true,
          avatar: userSecurity.user.avatar,
          name: userSecurity.user.name,
        },
      },
    };
  }

  async resendVerificationEmail(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        security: true,
      },
    });

    if (!user || !user.security) {
      return {
        message: 'If the email exists, a verification email has been sent.',
      };
    }

    if (user.security.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new token
    const { token, expiresAt } =
      this.tokenService.generateEmailVerificationToken();
    try {
      await this.prisma.userSecurity.update({
        where: { userId: user.id },
        data: {
          emailVerificationToken: token,
          emailVerificationExpires: expiresAt,
        },
      });

      await this.emailService
        .sendVerificationEmail(user.email, user.name, token)
        .catch((err) => console.error('Resend Email Error:', err));

      await this.auditService.log({
        userId: user.id,
        action: 'RESEND_VERIFICATION',
        ipAddress,
        userAgent,
        success: true,
      });

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Resend Verification Failed:', error);
      throw new InternalServerErrorException(
        'Could not resend verification email',
      );
    }
  }
}
