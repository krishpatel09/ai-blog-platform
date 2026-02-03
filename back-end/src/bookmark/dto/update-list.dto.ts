import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBookmarkListDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
