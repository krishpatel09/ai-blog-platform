import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  // Matches,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty({
    message: 'Username is required',
  })
  @MaxLength(20)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  readonly email: string;

  @MinLength(6, {
    message: 'Password too short',
  })
  @IsNotEmpty({
    message: 'Password is required',
  })
  password: string;
}
