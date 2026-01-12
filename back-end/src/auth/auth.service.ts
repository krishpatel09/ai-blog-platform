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
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { slugifyEmail } from '../utils/username.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) { }


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
    const { token, expiresAt } = this.tokenService.generateEmailVerificationToken();
    try {
      const result = await this.prisma.$transaction(async (tx) => {
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
                emailVerificationExpires: expiresAt
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
      }, {
        timeout: 15000,
      });
      console.log('User created after transaction');
      //send verification email
      this.emailService.sendVerificationEmail(
        result.email,
        result.name,
        token,
      ).catch(err => console.error('Email sending failed:', err));
      console.log('Verification email sent');

      console.log('Signup successful');
      return {
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          user: {
            id: result.id,
            username: result.username,
            email: result.email,
            emailVerified: result.security?.emailVerified || false,
          },
        },
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async signin(signinDto: SigninDto, ipAddress?: string, userAgent?: string) {
    const { email, password, rememberMe = false } = signinDto;

    console.log('signinDto', signinDto);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { security: true },
      });

      if (!user || !user.security || !(await bcrypt.compare(password, user.security.password))) {
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

      const { token: refreshToken, expiresInMs } = await this.tokenService.generateRefreshToken(
        user.id,
        rememberMe,
      );

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
          },
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Login Error:', error);
      throw new InternalServerErrorException('Internal server error')
    }
  }

  async logout(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    try {

      await this.tokenService.deleteRefreshToken(refreshToken);

      await this.auditService.log({
        userId,
        action: 'LOGOUT',
        ipAddress,
        userAgent,
        success: true,
      });
    } catch (error) {
      console.warn(
        'Logout cleanup warning:',
        error instanceof Error ? error.message : 'Invalid token provided',
      );
    } finally {
      this.tokenService.cleanupExpiredTokens().catch(console.error);
    }
    return { message: 'Logged out successfully' };
  }

  async refreshToken(
    dto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const oldRefreshToken = await this.tokenService.validateRefreshToken(
        dto.refreshToken,
      );

      if (oldRefreshToken.isRevoked) {
        await this.auditService.log({
          userId: oldRefreshToken.userId,
          action: 'TOKEN_REFRESH_FAILED',
          ipAddress,
          userAgent,
          success: false,
        });
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.refreshToken.update({
          where: {
            id: oldRefreshToken.id
          },
          data: {
            isRevoked: true
          }
        });

        const { token: newRefreshToken } = await this.tokenService.generateRefreshToken(
          oldRefreshToken.user.id,
          false,
        );

        const accessToken = this.tokenService.generateAccessToken({
          userId: oldRefreshToken.user.id,
          username: oldRefreshToken.user.username,
          email: oldRefreshToken.user.email,
        });

        await this.auditService.log({
          userId: oldRefreshToken.user.id,
          action: 'TOKEN_REFRESH',
          ipAddress,
          userAgent,
          success: true,
        });
        return {
          message: 'Token refreshed successfully',
          success: true,
          data: {
            accessToken,
            refreshToken: newRefreshToken,
            user: {
              id: oldRefreshToken.user.id,
              username: oldRefreshToken.user.username,
              email: oldRefreshToken.user.email,
              emailVerified: oldRefreshToken.user.security?.emailVerified || false,
            },
          }
        };
      })
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error(error);
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
    if (userSecurity.emailVerificationExpires && now > userSecurity.emailVerificationExpires) {
      throw new BadRequestException('Verification link has expired. Please request a new one.');
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

    const { token: refreshToken } = await this.tokenService.generateRefreshToken(
      userSecurity.user.id,
      false,
    );

    await this.auditService.log({
      userId: userSecurity.user.id,
      action: 'EMAIL_VERIFIED',
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      success: true,
      message: 'Email verified successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userSecurity.user.id,
          username: userSecurity.user.username,
          email: userSecurity.user.email,
          emailVerified: userSecurity.emailVerified,
        }
      }
    };
  }

  async resendVerificationEmail(email: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        security: true

      }
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
    const { token, expiresAt } = this.tokenService.generateEmailVerificationToken();
    try {

      await this.prisma.userSecurity.update({
        where: { userId: user.id },
        data: {
          emailVerificationToken: token,
          emailVerificationExpires: expiresAt,
        },
      });

      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        token,
      ).catch(err => console.error('Resend Email Error:', err));

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
      throw new InternalServerErrorException('Could not resend verification email');
    }
  }
}
