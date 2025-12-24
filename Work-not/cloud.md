# 🔐 Enhanced Authentication Flow - Production Ready

## 🆕 What's New in This Version

This enhanced version adds critical security features missing from the base implementation:

1. ✅ Rate limiting to prevent brute force attacks
2. ✅ Strong password policies
3. ✅ Email verification flow
4. ✅ Refresh token reuse detection
5. ✅ Device/IP tracking
6. ✅ Security headers with Helmet
7. ✅ Account lockout mechanism
8. ✅ Token blacklisting for immediate logout
9. ✅ CORS configuration
10. ✅ Audit logging

---

## 📦 Required Dependencies

```bash
# Install additional security packages
npm install @nestjs/throttler helmet class-validator class-transformer
npm install @nestjs/config nodemailer
npm install -D @types/nodemailer

# For Redis (token blacklist)
npm install ioredis
npm install -D @types/ioredis
```

---

## 🗄️ Enhanced Database Schema

```prisma
// prisma/schema.prisma

model user {
  id                  Int              @id @default(autoincrement())
  username            String           @db.VarChar(20)
  email               String           @unique @db.VarChar(255)
  password            String           @db.VarChar(255)
  emailVerified       Boolean          @default(false)
  emailVerificationToken String?       @unique
  isActive            Boolean          @default(true)
  loginAttempts       Int              @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  lastLoginIp         String?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  
  tokens              RefreshToken[]
  auditLogs           AuditLog[]
  
  @@index([email])
}

model RefreshToken {
  id            Int      @id @default(autoincrement())
  token         String   @unique @db.VarChar(128)
  userId        Int
  expiresAt     DateTime
  ipAddress     String?  @db.VarChar(45)
  userAgent     String?  @db.VarChar(500)
  isRevoked     Boolean  @default(false)
  revokedAt     DateTime?
  parentTokenId Int?     // For detecting token reuse
  createdAt     DateTime @default(now())
  
  user          user     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  action    String   @db.VarChar(50)  // LOGIN, LOGOUT, SIGNUP, PASSWORD_CHANGE, etc.
  ipAddress String?  @db.VarChar(45)
  userAgent String?  @db.VarChar(500)
  details   String?  @db.Text
  success   Boolean  @default(true)
  createdAt DateTime @default(now())
  
  user      user?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

---

## 🔧 Enhanced DTOs

### signup.dto.ts
```typescript
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username must not exceed 20 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores and hyphens'
  })
  username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)'
  })
  password: string;
}
```

### verify-email.dto.ts
```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
```

### resend-verification.dto.ts
```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
```

---

## 🛡️ Rate Limiting Configuration

### throttler.config.ts
```typescript
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000,  // 1 second
      limit: 3,   // 3 requests
    },
    {
      name: 'medium',
      ttl: 60000, // 1 minute
      limit: 20,  // 20 requests
    },
    {
      name: 'long',
      ttl: 900000, // 15 minutes
      limit: 100,  // 100 requests
    }
  ]
};
```

### app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { throttlerConfig } from './config/throttler.config';

@Module({
  imports: [
    ThrottlerModule.forRoot(throttlerConfig),
    // ... other modules
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

---

## 🔒 Enhanced Token Service

### services/token.service.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { Redis } from 'ioredis';

@Injectable()
export class TokenService {
  private redis: Redis;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {
    // Initialize Redis for token blacklist
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  generateAccessToken(payload: {
    userId: number;
    username: string;
    email: string;
    emailVerified: boolean;
  }): string {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
  }

  async generateRefreshToken(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
    parentTokenId?: number,
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
        parentTokenId,
      },
    });

    return token;
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.isRevoked) {
      // Token reuse detected - revoke all tokens for this user
      await this.revokeAllUserTokens(refreshToken.userId);
      throw new UnauthorizedException('Token reuse detected. All sessions revoked.');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.deleteRefreshToken(token);
      throw new UnauthorizedException('Refresh token expired');
    }

    return refreshToken;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    }).catch(() => {
      // Token already deleted, ignore error
    });
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  // Token blacklist methods (for immediate access token revocation)
  async blacklistAccessToken(token: string, expiresIn: number): Promise<void> {
    // Store token in Redis with TTL matching token expiry
    await this.redis.setex(`blacklist:${token}`, expiresIn, '1');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result === '1';
  }

  // Generate email verification token
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

---

## 📧 Email Service

### services/email.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, username: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${username}!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; 
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email Address
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, username: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${username},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #EF4444; 
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email and consider changing your password.</p>
        </div>
      `,
    });
  }
}
```

---

## 📊 Audit Service

### services/audit.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: number;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
    success?: boolean;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          details: data.details,
          success: data.success ?? true,
        },
      });
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  }

  async getUserActivity(userId: number, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getFailedLoginAttempts(email: string, since: Date) {
    // This would require additional logic to track by email before user is found
    return this.prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        details: { contains: email },
        createdAt: { gte: since },
      },
    });
  }
}
```

---

## 🔐 Enhanced Auth Service

### auth.service.ts
```typescript
import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async signup(dto: SignupDto, ipAddress?: string, userAgent?: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Generate email verification token
    const emailVerificationToken = this.tokenService.generateEmailVerificationToken();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
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

    // Send verification email
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
      emailVerified: user.emailVerified,
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

    // Cleanup expired tokens (non-blocking)
    this.tokenService.cleanupExpiredTokens().catch(console.error);

    return {
      accessToken,
      refreshToken,
      user,
      message: 'Signup successful. Please check your email to verify your account.',
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      await this.auditService.log({
        action: 'LOGIN_FAILED',
        ipAddress,
        userAgent,
        details: `Failed login attempt for ${dto.email}`,
        success: false,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingTime} minutes.`
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const loginAttempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts };

      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_TIME);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

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
          'Too many failed login attempts. Account locked for 15 minutes.'
        );
      }

      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset login attempts and update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
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

    // Cleanup expired tokens (non-blocking)
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
  }

  async logout(
    dto: RefreshTokenDto,
    accessToken?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Validate and get refresh token
    const refreshToken = await this.tokenService.validateRefreshToken(dto.refreshToken);

    // Blacklist access token if provided
    if (accessToken) {
      await this.tokenService.blacklistAccessToken(accessToken, 900); // 15 min TTL
    }

    // Delete refresh token
    await this.tokenService.deleteRefreshToken(dto.refreshToken);

    // Log logout
    await this.auditService.log({
      userId: refreshToken.userId,
      action: 'LOGOUT',
      ipAddress,
      userAgent,
      success: true,
    });

    // Cleanup expired tokens (non-blocking)
    this.tokenService.cleanupExpiredTokens().catch(console.error);

    return { message: 'Logged out successfully' };
  }

  async refreshToken(dto: RefreshTokenDto, ipAddress?: string, userAgent?: string) {
    // Validate refresh token
    const oldRefreshToken = await this.tokenService.validateRefreshToken(dto.refreshToken);

    // Generate new tokens
    const accessToken = this.tokenService.generateAccessToken({
      userId: oldRefreshToken.user.id,
      username: oldRefreshToken.user.username,
      email: oldRefreshToken.user.email,
      emailVerified: oldRefreshToken.user.emailVerified,
    });

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
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
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
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a verification email has been sent.' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new token
    const emailVerificationToken = this.tokenService.generateEmailVerificationToken();

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
```

---

## 🛡️ Enhanced JWT Strategy

### strategies/jwt.strategy.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from '../services/token.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true, // Pass request to validate method
    });
  }

  async validate(req: Request, payload: any) {
    // Extract token from header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // Check if token is blacklisted
    if (token && await this.tokenService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Validate user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    return user;
  }
}
```

---

## 🎯 Enhanced Auth Controller

### auth.controller.ts
```typescript
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Ip, 
  Headers,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 signups per minute
  async signup(
    @Body() dto: SignupDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.signup(dto, ip, userAgent);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('logout')
  async logout(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(dto, accessToken, ip, userAgent);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 refreshes per minute
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.refreshToken(dto, ip, userAgent);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: any) {
    return user;
  }
}
```

---

## 🔧 Main Application Setup

###