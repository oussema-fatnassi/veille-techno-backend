/**
 * Defines registration input validation and Swagger field metadata.
 * Password hashing and email uniqueness checks belong to AuthService.
 */

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'admin@test.com',
    description: 'Unique email address used to login.',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: 'Test1234.',
    description:
      'Password between 8 and 20 characters with at least one uppercase letter, one lowercase letter, and one number or special character.',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must be 8 to 20 characters long and contain at least one uppercase letter, one lowercase letter, and one number or special character',
  })
  readonly password: string;

  @ApiProperty({
    example: 'Demo Admin',
    description: 'Display name of the user.',
    minLength: 1,
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  readonly name: string;
}
