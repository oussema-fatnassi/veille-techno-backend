/**
 * Validates and documents optional profile changes for PATCH requests.
 * UsersService decides whether the caller may change the requested role.
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    example: 'updated.user@test.com',
    description:
      'New email address. It is normalized to lowercase before save.',
  })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({
    example: 'Updated User',
    description: 'New display name.',
    maxLength: 32,
  })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  readonly name?: string;

  @ApiPropertyOptional({
    example: 'Test1234.',
    description:
      'New password between 8 and 20 characters with at least one uppercase letter, one lowercase letter, and one number or special character.',
    minLength: 8,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must be 8 to 20 characters long and contain at least one uppercase letter, one lowercase letter, and one number or special character',
  })
  readonly password?: string;

  @ApiPropertyOptional({
    example: Role.ADMIN,
    description: 'New user role. Only an admin can update this field.',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  readonly role?: Role;
}
