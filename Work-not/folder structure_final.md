# 📁 Complete Enhanced Authentication Folder Structure

## 🗂️ Full Directory Tree

```
ai-blog-platform/
│
├── back-end/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │
│   │   ├── auth/                         
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── signup.dto.ts
│   │   │   │   ├── signin.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   ├── verify-email.dto.ts
│   │   │   │   ├── resend-verification.dto.ts
│   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   │
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── token.service.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   └── audit.service.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── email-verified.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   │
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   │
│   │   │   └── interfaces/
│   │   │       ├── jwt-payload.interface.ts
│   │   │       └── current-user.interface.ts
│   │   │
│   │   ├── cache/                        # 🧠 MongoDB Cache 
│   │   │   ├── cache.module.ts
│   │   │   ├── cache.service.ts
│   │   │   │
│   │   │   └── schemas/
│   │   │       ├── blacklisted-token.schema.ts
│   │   │       ├── rate-limit.schema.ts
│   │   │       └── session-cache.schema.ts
│   │   │
│   │   ├── prisma/                       # 🗄️ MySQL (Prisma)
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma.service.ts
│   │   │   └── schema.prisma
│   │   │
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── public.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── email-verified.guard.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   │
│   │   │   ├── filters/
│   │   │   │   ├── http-exception.filter.ts
│   │   │   │   └── prisma-exception.filter.ts
│   │   │   │
│   │   │   ├── pipes/
│   │   │   │   └── validation.pipe.ts
│   │   │   │
│   │   │   └── interfaces/
│   │   │       ├── response.interface.ts
│   │   │       └── pagination.interface.ts
│   │   │
│   │   ├── config/
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── throttler.config.ts
│   │   │   ├── mongodb.config.ts      
│   │   │   └── email.config.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── change-password.dto.ts
│   │   │   │
│   │   │   └── interfaces/
│   │   │       └── user.interface.ts
│   │   │
│   │   ├── blog/
│   │   │   ├── blog.module.ts
│   │   │   ├── blog.controller.ts
│   │   │   ├── blog.service.ts
│   │   │   │
│   │   │   └── dto/
│   │   │       ├── create-post.dto.ts
│   │   │       └── update-post.dto.ts
│   │   │
│   │   └── templates/
│   │       └── email/
│   │           ├── verify-email.hbs
│   │           ├── reset-password.hbs
│   │           └── welcome.hbs
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   ├── auth.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
│
└── front-end/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   │
    │   │   ├── (auth)/
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx
    │   │   │   ├── signup/
    │   │   │   │   └── page.tsx
    │   │   │   ├── verify-email/
    │   │   │   │   └── page.tsx
    │   │   │   ├── forgot-password/
    │   │   │   │   └── page.tsx
    │   │   │   └── reset-password/
    │   │   │       └── page.tsx
    │   │   │
    │   │   └── (dashboard)/
    │   │       ├── dashboard/
    │   │       │   └── page.tsx
    │   │       └── profile/
    │   │           └── page.tsx
    │   │
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── SignupForm.tsx
    │   │   │   ├── ForgotPasswordForm.tsx
    │   │   │   └── ResetPasswordForm.tsx
    │   │   │
    │   │   ├── layout/
    │   │   │   ├── Header.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   └── Sidebar.tsx
    │   │   │
    │   │   └── ui/
    │   │       ├── Button.tsx
    │   │       ├── Input.tsx
    │   │       ├── Card.tsx
    │   │       └── Modal.tsx
    │   │
    │   ├── lib/
    │   │   ├── api/
    │   │   │   ├── auth.api.ts
    │   │   │   ├── user.api.ts
    │   │   │   └── axios.config.ts
    │   │   │
    │   │   ├── hooks/
    │   │   │   ├── useAuth.ts
    │   │   │   ├── useUser.ts
    │   │   │   └── useLocalStorage.ts
    │   │   │
    │   │   ├── context/
    │   │   │   ├── AuthContext.tsx
    │   │   │   └── ThemeContext.tsx
    │   │   │
    │   │   ├── utils/
    │   │   │   ├── validation.ts
    │   │   │   ├── storage.ts
    │   │   │   └── formatters.ts
    │   │   │
    │   │   └── types/
    │   │       ├── auth.types.ts
    │   │       ├── user.types.ts
    │   │       └── api.types.ts
    │   │
    │   ├── styles/
    │   │   └── globals.css
    │   │
    │   └── middleware.ts
    │
    ├── public/
    │   ├── favicon.ico
    │   └── images/
    │
    ├── .env.local
    ├── .env.example
    ├── .gitignore
    ├── .eslintrc.json
    ├── next.config.js
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── README.md
```

---

## 📝 File Creation Guide

### 1️⃣ Create Backend Structure

```bash
# Navigate to your project
cd ai-blog-platform

# Create backend structure
mkdir -p back-end/src/{auth/{dto,strategies,services,guards,decorators,interfaces},prisma,common/{decorators,guards,interceptors,filters,pipes,interfaces},config,users/{dto,interfaces},blog/dto,templates/email}

mkdir -p back-end/prisma/migrations
mkdir -p back-end/test
```

### 2️⃣ Create Frontend Structure

```bash
# Create frontend structure
mkdir -p front-end/src/{app/{(auth)/{login,signup,verify-email,forgot-password,reset-password},(dashboard)/{dashboard,profile}},components/{auth,layout,ui},lib/{api,hooks,context,utils,types},styles}

mkdir -p front-end/public/images
```

---

## 📄 Essential Files to Create

### Backend Files

#### 1. `back-end/src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  
  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
```

#### 2. `back-end/src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { throttlerConfig } from './config/throttler.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot(throttlerConfig),
    PrismaModule,
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

#### 3. `back-end/src/auth/auth.module.ts`
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

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    EmailService,
    AuditService,
    JwtStrategy,
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
```

#### 4. `back-end/src/prisma/prisma.module.ts`
```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### 5. `back-end/src/prisma/prisma.service.ts`
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }
}
```

#### 6. `back-end/src/config/throttler.config.ts`
```typescript
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000,
      limit: 3,
    },
    {
      name: 'medium',
      ttl: 60000,
      limit: 20,
    },
    {
      name: 'long',
      ttl: 900000,
      limit: 100,
    },
  ],
};
```

#### 7. `back-end/src/common/decorators/current-user.decorator.ts`
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserType {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserType }>();
    return request.user;
  },
);
```

#### 8. `back-end/src/common/guards/jwt-auth.guard.ts`
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

#### 9. `back-end/.env.example`
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="mysql://user:password@localhost:3306/ai_blog_platform"

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

#### 10. `back-end/package.json` (key dependencies)
```json