import { IsEmail, IsNotEmpty, MaxLength, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  readonly email: string;

  @IsString()
  @IsNotEmpty({
    message: 'Password is required',
  })
  readonly password: string;
}
