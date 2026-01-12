import { IsEmail, IsNotEmpty, MaxLength, IsString, IsBoolean, IsOptional } from 'class-validator';

export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  readonly email: string;

  @IsString()
  @IsNotEmpty({
    message: 'Password is required',
  })
  readonly password: string;

  @IsBoolean()
  @IsOptional()
  readonly rememberMe?: boolean;
}
