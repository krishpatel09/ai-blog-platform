import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: any;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  publishedAt?: string;

  @IsString()
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
}
