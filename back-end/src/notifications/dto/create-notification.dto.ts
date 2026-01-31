import { NotificationType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;

  @IsOptional()
  @IsUUID()
  actorId?: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsUUID()
  postId?: string;

  @IsOptional()
  @IsUUID()
  commentId?: string;
}
