import { IsArray, IsString } from 'class-validator';

export class ReorderBookmarkItemsDto {
  @IsArray()
  @IsString({ each: true })
  postIds: string[];
}
