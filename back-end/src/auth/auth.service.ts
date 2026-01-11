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
    const { token, expiresAt } =
      this.tokenService.generateEmailVerificationToken();

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

        //send verification email
        await this.emailService.sendVerificationEmail(
          user.email,
          user.name,
          token,
        );
        console.log('Verification email sent');

        // Log signup
        await this.auditService.log({
          userId: user.id,
          action: 'SIGNUP',
          ipAddress,
          userAgent,
          success: true,
        });

        console.log('Signup successful');
        return {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            emailVerified: user.security?.emailVerified || false,
          },
          message: 'Registration successful. Please verify your email.',
        };
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async signin(signinDto: SigninDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = signinDto;

    console.log('signinDto', signinDto);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { security: true },
      });

      if (!user || !user.security) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!(await bcrypt.compare(password, user.security.password))) {
        throw new UnauthorizedException('Invalid email or password');
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

      // Log successful login
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN',
        ipAddress,
        userAgent,
        success: true,
      });
      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.security.emailVerified,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async logout(
    accessToken?: string,
    refreshToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // Only validate and revoke if refresh token exists and is not empty
    if (!refreshToken || refreshToken.trim() === '') {
      return { message: 'Logged out successfully' };
    }
    try {
      const refreshTokenRecord = await this.tokenService.validateRefreshToken(refreshToken);

      await this.tokenService.deleteRefreshToken(refreshToken);

      await this.auditService.log({
        userId: refreshTokenRecord.userId,
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

        const newRefreshToken = await this.tokenService.generateRefreshToken(
          oldRefreshToken.user.id,
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
          accessToken,
          refreshToken: newRefreshToken,
          user: {
            id: oldRefreshToken.user.id,
            username: oldRefreshToken.user.username,
            email: oldRefreshToken.user.email,
            emailVerified: oldRefreshToken.user.security?.emailVerified || false,
          },
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

    const refreshToken = await this.tokenService.generateRefreshToken(
      userSecurity.user.id,
    );

    await this.auditService.log({
      userId: userSecurity.user.id,
      action: 'EMAIL_VERIFIED',
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
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
    );

    await this.auditService.log({
      userId: user.id,
      action: 'RESEND_VERIFICATION',
      ipAddress,
      userAgent,
      success: true,
    });

    return { message: 'Verification email sent successfully' };
  }
}
