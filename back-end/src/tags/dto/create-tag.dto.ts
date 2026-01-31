import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
