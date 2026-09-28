/**
 * Defines optional title and position changes with validation and Swagger metadata.
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
} from 'class-validator';

export class UpdateListDto {
  @ApiPropertyOptional({
    example: 'In Progress',
    description: 'New title of the list.',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  readonly title?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'New position of the list in the board.',
  })
  @IsOptional()
  @IsInt()
  readonly position?: number;
}
