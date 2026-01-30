import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path if needed
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './gateways/notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createAndSend(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          recipientId: createNotificationDto.recipientId,
          actorId: createNotificationDto.actorId,
          type: createNotificationDto.type,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          data: createNotificationDto.data || {},
          postId: createNotificationDto.postId,
          commentId: createNotificationDto.commentId,
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      this.notificationGateway.sendToUser(
        createNotificationDto.recipientId,
        notification,
      );

      return notification;
    } catch (error) {
      this.logger.error('Failed to create and send notification', error);
      return null;
    }
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  async remove(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
