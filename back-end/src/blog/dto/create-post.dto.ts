import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsOptional()
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
  publishedAt?: string; // ISO Date string
}
