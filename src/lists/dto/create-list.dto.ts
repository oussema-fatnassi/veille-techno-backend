/**
 * Validates and documents list creation input; ownership comes from the JWT.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateListDto {
  @ApiProperty({
    example: 'Todo',
    description: 'Title of the list.',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly title: string;

  @ApiPropertyOptional({
    example: 0,
    description:
      'Position of the list in the board. If omitted, the API places the list at the end.',
  })
  @IsOptional()
  @IsInt()
  readonly position?: number;
}
