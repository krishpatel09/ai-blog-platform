import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import jwtConfig from './config/jwt.config';
import refreshJwtConfig from './config/refresh-jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import databaseConfig from './config/database.config';
import imagekitConfig from './config/imagekit.config';
import { ClerkWebhookModule } from './webhooks/clerk/clerk.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { BlogModule } from './blog/blog.module';
import { ImageKitModule } from './ImageKit/imagekit.module';
import { AiModule } from './ai/ai.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, refreshJwtConfig, databaseConfig, imagekitConfig],
    }),
    PrismaModule,
    AuthModule,
    ClerkWebhookModule,
    TagsModule,
    UsersModule,
    BlogModule,
    ImageKitModule,
    AiModule,
    BookmarkModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
