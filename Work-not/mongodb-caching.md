# 🔐 Enhanced Authentication Flow - Production Ready (MongoDB Caching)

## 🆕 What's New in This Version

This enhanced version adds critical security features with **MongoDB for caching** instead of Redis:

1. ✅ Rate limiting to prevent brute force attacks
2. ✅ Strong password policies
3. ✅ Email verification flow
4. ✅ Refresh token reuse detection
5. ✅ Device/IP tracking
6. ✅ Security headers with Helmet
7. ✅ Account lockout mechanism
8. ✅ **MongoDB-based token blacklisting** for immediate logout
9. ✅ CORS configuration
10. ✅ Audit logging

---
ai-blog-platform/
│
├── back-end/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │
│   │   ├── auth/                         # 🔐 Authentication Module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │
│   │   │   ├── dto/
│   │   │   │   ├── signup.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │
│   │   │   ├── services/
│   │   │   │   ├── token.service.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   └── audit.service.ts
│   │   │
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │
│   │   │   └── guards/
│   │   │       └── jwt-auth.guard.ts
│   │   │
│   │   ├── cache/                        # 🧠 MongoDB Caching Layer
│   │   │   ├── cache.module.ts
│   │   │   ├── cache.service.ts
│   │   │
│   │   │   └── schemas/
│   │   │       ├── blacklisted-token.schema.ts
│   │   │       ├── rate-limit.schema.ts
│   │   │       └── session-cache.schema.ts
│   │   │
│   │   ├── prisma/                       # 🗄️ Prisma (MySQL)
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── schema.prisma
│   │   │
│   │   ├── users/                        # 👤 Users Module (future-ready)
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   │
│   │   ├── common/                       # ♻️ Shared Utilities
│   │   │   ├── decorators/
│   │   │   │   └── current-user.decorator.ts
│   │   │   │
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   └── logging.interceptor.ts
│   │   │   │
│   │   │   └── constants/
│   │   │       └── auth.constants.ts
│   │   │
│   │   ├── config/                       # ⚙️ App Configuration
│   │   │   ├── throttler.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── mail.config.ts
│   │   │
│   │   └── utils/
│   │       ├── crypto.util.ts
│   │       └── ip.util.ts
│   │
│   ├── prisma/
│   │   └── migrations/
│   │
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
└── README.md


## 📦 Required Dependencies

```bash
# Install security packages
npm install @nestjs/throttler helmet class-validator class-transformer
npm install @nestjs/config nodemailer
npm install -D @types/nodemailer

# For MongoDB caching (using Mongoose)
npm install @nestjs/mongoose mongoose
```

---

## 🗄️ Enhanced Database Schema

### Prisma Schema (MySQL - Main Database)
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
  parentTokenId Int?
  createdAt     DateTime @default(now())
  
  user          user     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  action    String   @db.VarChar(50)
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

### MongoDB Schema (Caching Layer)
```typescript
// src/cache/schemas/blacklisted-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BlacklistedToken extends Document {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, index: { expires: 0 } })
  expiresAt: Date;

  @Prop()
  reason?: string;
}

export const BlacklistedTokenSchema = SchemaFactory.createForClass(BlacklistedToken);

// TTL index to automatically delete expired tokens
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

```typescript
// src/cache/schemas/rate-limit.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RateLimit extends Document {
  @Prop({ required: true, index: true })
  key: string; // e.g., "login:192.168.1.1" or "signup:user@email.com"

  @Prop({ required: true })
  attempts: number;

  @Prop({ required: true })
  windowStart: Date;

  @Prop({ required: true, index: { expires: 0 } })
  expiresAt: Date;
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);

// TTL index
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

```typescript
// src/cache/schemas/session-cache.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SessionCache extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: number;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop({ required: true, index: { expires: 0 } })
  expiresAt: Date;
}

export const SessionCacheSchema = SchemaFactory.createForClass(SessionCache);

// TTL index
SessionCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## 🔧 MongoDB Cache Module

### cache.module.ts
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from './cache.service';
import { BlacklistedToken, BlacklistedTokenSchema } from './schemas/blacklisted-token.schema';
import { RateLimit, RateLimitSchema } from './schemas/rate-limit.schema';
import { SessionCache, SessionCacheSchema } from './schemas/session-cache.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
      { name: RateLimit.name, schema: RateLimitSchema },
      { name: SessionCache.name, schema: SessionCacheSchema },
    ]),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

### cache.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlacklistedToken } from './schemas/blacklisted-token.schema';
import { RateLimit } from './schemas/rate-limit.schema';
import { SessionCache } from './schemas/session-cache.schema';

@Injectable()
export class CacheService {
  constructor(
    @InjectModel(BlacklistedToken.name)
    private blacklistedTokenModel: Model<BlacklistedToken>,
    @InjectModel(RateLimit.name)
    private rateLimitModel: Model<RateLimit>,
    @InjectModel(SessionCache.name)
    private sessionCacheModel: Model<SessionCache>,
  ) {}

  // ==================== Token Blacklist ====================
  
  async blacklistToken(
    token: string,
    userId: number,
    expiresInSeconds: number,
    reason?: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    
    await this.blacklistedTokenModel.create({
      token,
      userId,
      expiresAt,
      reason,
    });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.blacklistedTokenModel.findOne({ 
      token,
      expiresAt: { $gt: new Date() },
    });
    return !!result;
  }

  async removeBlacklistedToken(token: string): Promise<void> {
    await this.blacklistedTokenModel.deleteOne({ token });
  }

  async blacklistAllUserTokens(userId: number, expiresInSeconds: number = 900): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    
    // Mark all user's tokens as blacklisted (using a pattern)
    await this.blacklistedTokenModel.create({
      token: `user:${userId}:*`,
      userId,
      expiresAt,
      reason: 'All sessions revoked',
    });
  }

  // ==================== Rate Limiting ====================

  async checkRateLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowSeconds * 1000);

    let rateLimit = await this.rateLimitModel.findOne({
      key,
      windowStart: { $gte: windowStart },
    });

    if (!rateLimit) {
      // Create new rate limit entry
      const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
      rateLimit = await this.rateLimitModel.create({
        key,
        attempts: 1,
        windowStart: now,
        expiresAt,
      });

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: expiresAt,
      };
    }

    // Check if limit exceeded
    if (rateLimit.attempts >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: rateLimit.expiresAt,
      };
    }

    // Increment attempts
    rateLimit.attempts += 1;
    await rateLimit.save();

    return {
      allowed: true,
      remaining: maxAttempts - rateLimit.attempts,
      resetAt: rateLimit.expiresAt,
    };
  }

  async resetRateLimit(key: string): Promise<void> {
    await this.rateLimitModel.deleteOne({ key });
  }

  // ==================== Session Cache ====================

  async setCache(
    userId: number,
    data: Record<string, any>,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.sessionCacheModel.findOneAndUpdate(
      { userId },
      { userId, data, expiresAt },
      { upsert: true, new: true },
    );
  }

  async getCache(userId: number): Promise<Record<string, any> | null> {
    const cache = await this.sessionCacheModel.findOne({
      userId,
      expiresAt: { $gt: new Date() },
    });

    return cache ? cache.data : null;
  }

  async deleteCache(userId: number): Promise<void> {
    await this.sessionCacheModel.deleteOne({ userId });
  }

  async clearExpiredCache(): Promise<void> {
    const now = new Date();
    await this.blacklistedTokenModel.deleteMany({ expiresAt: { $lt: now } });
    await this.rateLimitModel.deleteMany({ expiresAt: { $lt: now } });
    await this.sessionCacheModel.deleteMany({ expiresAt: { $lt: now } });
  }
}
```

---

## 🔒 Enhanced Token Service (MongoDB Version)

### services/token.service.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

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
      // Token reuse detected - revoke all tokens
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
    }).catch(() => {});
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    // Blacklist all user tokens in MongoDB cache
    await this.cacheService.blacklistAllUserTokens(userId, 900);
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Clean expired cache entries
    await this.cacheService.clearExpiredCache();
  }

  // MongoDB-based token blacklisting
  async blacklistAccessToken(token: string, expiresIn: number): Promise<void> {
    // Extract userId from token
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      
      await this.cacheService.blacklistToken(
        token,
        decoded.userId,
        expiresIn,
        'Manual logout',
      );
    } catch (error) {
      // Token invalid, skip blacklisting
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.cacheService.isTokenBlacklisted(token);
  }

  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

---

## 🛡️ Enhanced JWT Strategy (MongoDB Version)

### strategies/jwt.strategy.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../cache/cache.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // Check if token is blacklisted in MongoDB
    if (token && await this.cacheService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Check for user-level token revocation
    const userBlacklist = await this.cacheService.isTokenBlacklisted(
      `user:${payload.userId}:*`
    );
    if (userBlacklist) {
      throw new UnauthorizedException('All user sessions have been revoked');
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

## 📊 Enhanced Auth Service (MongoDB Version)

### auth.service.ts
```typescript
import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException,
  ConflictException,
  TooManyRequestsException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { CacheService } from '../cache/cache.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60; // seconds

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private auditService: AuditService,
    private cacheService: CacheService,
  ) {}

  async signup(dto: SignupDto, ipAddress?: string, userAgent?: string) {
    // Rate limiting using MongoDB
    const rateLimitKey = `signup:${ipAddress}`;
    const rateLimit = await this.cacheService.checkRateLimit(
      rateLimitKey,
      3, // max 3 signups
      RATE_LIMIT_WINDOW,
    );

    if (!rateLimit.allowed) {
      throw new TooManyRequestsException(
        `Too many signup attempts. Try again after ${Math.ceil(
          (rateLimit.resetAt.getTime() - Date.now()) / 1000
        )} seconds`
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const emailVerificationToken = this.tokenService.generateEmailVerificationToken();

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

    await this.emailService.sendVerificationEmail(
      user.email,
      user.username,
      emailVerificationToken,
    );

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

    await this.auditService.log({
      userId: user.id,
      action: 'SIGNUP',
      ipAddress,
      userAgent,
      success: true,
    });

    this.tokenService.cleanupExpiredTokens().catch(console.error);

    return {
      accessToken,
      refreshToken,
      user,
      message: 'Signup successful. Please check your email to verify your account.',
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    // Rate limiting using MongoDB
    const rateLimitKey = `login:${ipAddress}`;
    const rateLimit = await this.cacheService.checkRateLimit(
      rateLimitKey,
      5, // max 5 login attempts
      RATE_LIMIT_WINDOW,
    );

    if (!rateLimit.allowed) {
      throw new TooManyRequestsException(
        `Too many login attempts. Try again after ${Math.ceil(
          (rateLimit.resetAt.getTime() - Date.now()) / 1000
        )} seconds`
      );
    }

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

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingTime} minutes.`
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
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

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

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

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      ipAddress,
      userAgent,
      success: true,
    });

    // Reset rate limit on successful login
    await this.cacheService.resetRateLimit(rateLimitKey);

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
    const refreshToken = await this.tokenService.validateRefreshToken(dto.refreshToken);

    // Blacklist access token in MongoDB
    if (accessToken) {
      await this.tokenService.blacklistAccessToken(accessToken, 900);
    }

    await this.tokenService.deleteRefreshToken(dto.refreshToken);

    await this.auditService.log({
      userId: refreshToken.userId,
      action: 'LOGOUT',
      ipAddress,
      userAgent,
      success: true,
    });

    this.tokenService.cleanupExpiredTokens().catch(console.error);

    return { message: 'Logged out successfully' };
  }

  async refreshToken(dto: RefreshTokenDto, ipAddress?: string, userAgent?: string) {
    const oldRefreshToken = await this.tokenService.validateRefreshToken(dto.refreshToken);

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
      oldRefreshToken.id,
    );

    await this.prisma.refreshToken.update({
      where: { id: oldRefreshToken.id },
      data: { isRevoked: true, revokedAt: new Date() },
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
      return { message: 'If the email exists, a verification email has been sent.' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

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

## 🔧 App Module Configuration (MongoDB Version)

### app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { UsersModule } from './users/users.module';
import { throttlerConfig } from './config/throttler.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // MongoDB connection for caching
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-blog-cache', {
      connectionFactory: (connection) => {
        console.log('✅ MongoDB Cache connected');
        return connection;
      },
    }),
    ThrottlerModule.forRoot(throttlerConfig),
    PrismaModule,
    CacheModule,
    AuthModule,
    UsersModule,
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

### auth.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';