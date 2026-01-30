import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationGateway');

  afterInit(server: Server) {
    this.logger.log('Notification Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    if (payload.userId) {
      const roomName = `user_${payload.userId}`;
      client.join(roomName);
      this.logger.log(`Client ${client.id} joined room ${roomName}`);
      return { event: 'joinedRoom', data: roomName };
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    if (payload.userId) {
      const roomName = `user_${payload.userId}`;
      client.leave(roomName);
      this.logger.log(`Client ${client.id} left room ${roomName}`);
      return { event: 'leftRoom', data: roomName };
    }
  }

  sendToUser(userId: string, notification: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit('newNotification', notification);
    this.logger.log(`Notification sent to room ${roomName}`);
  }
}
