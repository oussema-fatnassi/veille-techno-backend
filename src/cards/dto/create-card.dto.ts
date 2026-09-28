/**
 * Validates and documents card creation fields; the parent list comes from the URL.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateCardDto {
  @ApiProperty({
    example: 'Implement login',
    description: 'Title of the card.',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly title: string;

  @ApiPropertyOptional({
    example: 'Create JWT login endpoint and return an access token.',
    description: 'Optional card description.',
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({
    example: 0,
    description:
      'Position of the card in the list. If omitted, the API places the card at the end.',
  })
  @IsOptional()
  @IsInt()
  readonly position?: number;
}
