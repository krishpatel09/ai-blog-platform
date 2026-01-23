import { IsUUID } from 'class-validator';

export class AddBookmarkItemDto {
  @IsUUID()
  postId: string;
}
