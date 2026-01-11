import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'name must be at least 3 characters long' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  readonly email: string;

  @IsNotEmpty({
    message: 'Password is required',
  })
  @IsString()
  @MinLength(6, {
    message: 'Password too short',
  })
  password: string;
}
