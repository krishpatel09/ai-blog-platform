import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { NotificationGateway } from './gateways/notification.gateway';
import { PrismaModule } from '../prisma/prisma.module';

import { NotificationsController } from './notifications.controller';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService, NotificationGateway],
  controllers: [NotificationsController],
  exports: [NotificationService],
})
export class NotificationsModule {}
