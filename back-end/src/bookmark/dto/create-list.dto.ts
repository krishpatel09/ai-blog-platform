import { IsString, MaxLength } from 'class-validator';

export class CreateBookmarkListDto {
  @IsString()
  @MaxLength(50)
  name: string;
}
