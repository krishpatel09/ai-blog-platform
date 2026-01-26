import { Module } from '@nestjs/common';
import { UserFollowService } from './userfollow.service';
import { UserFollowController } from './userfollow.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserFollowController],
  providers: [UserFollowService],
  exports: [UserFollowService],
})
export class UserFollowModule {}
