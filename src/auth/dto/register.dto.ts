import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must be 8 to 20 characters long and contain at least one uppercase letter, one lowercase letter, and one number or special character',
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  readonly name: string;
}
