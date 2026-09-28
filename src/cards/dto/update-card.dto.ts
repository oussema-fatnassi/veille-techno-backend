import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class UpdateCardDto {
  @ApiPropertyOptional({
    example: 'Updated card title',
    description: 'New title of the card.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  readonly title?: string;

  @ApiPropertyOptional({
    example: 'Updated card description.',
    description: 'New optional card description.',
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'New position of the card in its list.',
  })
  @IsOptional()
  @IsInt()
  readonly position?: number;

  @ApiPropertyOptional({
    example: 2,
    description:
      'Target list ID used to move the card. The target list must belong to the authenticated user.',
  })
  @IsOptional()
  @IsInt()
  readonly listId?: number;
}
