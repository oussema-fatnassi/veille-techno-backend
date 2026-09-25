import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly name?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must be 8 to 20 characters long and contain at least one uppercase letter, one lowercase letter, and one number or special character',
  })
  readonly password?: string;

  @IsOptional()
  @IsEnum(Role)
  readonly role?: Role;
}
