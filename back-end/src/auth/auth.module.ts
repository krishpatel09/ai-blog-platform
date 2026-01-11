import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { AuditService } from './services/audit.service';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const config = configService.get<JwtModuleOptions>('jwt');
        if (!config?.secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        return {
          secret: config.secret,
          signOptions: config.signOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    EmailService,
    AuditService,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
