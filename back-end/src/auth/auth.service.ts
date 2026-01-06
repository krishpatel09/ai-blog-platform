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
import { use } from 'passport';
 

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

    console.log('signinDto', signinDto);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      const refreshToken = await this.tokenService.generateRefreshToken(user.id);

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
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const emailVerificationToken =
        this.tokenService.generateEmailVerificationToken();

      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          emailVerified: false,
          emailVerificationToken,
          isActive: true,
        },
      });

      //send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        user.username,
        emailVerificationToken,
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
        message: 'Registration successful. Please verify your email.',
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
      const token = await this.prisma.refreshToken.findMany({
        where: { token: refreshToken },
        include: { user: true },
      });
      

      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      await this.auditService.log({
        userId: token[0].userId,
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

      const user = oldRefreshToken.user;
      const accessToken = this.tokenService.generateAccessToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      });

      const newRefreshToken = await this.tokenService.generateRefreshToken(user.id);

      await this.prisma.refreshToken.update({
        where: { id: oldRefreshToken.id },
        data: { isRevoked: true },
      });

      // Log token refresh
      await this.auditService.log({
        userId: user.id,
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
    try{

      console.log('Verifying email with token:', token);
      const user = await this.prisma.user.findFirst({
        where: { emailVerificationToken: { equals: token } },
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
    
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });
    
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);
    
    console.log('Generated tokens after email verification', user.id);
    
    await this.auditService.log({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      success: true,
    });
    
    return {
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.error(error);
    throw new InternalServerErrorException('Internal server error');
  } 
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
