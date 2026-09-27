import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  readonly title?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsOptional()
  @IsInt()
  readonly position?: number;

  @IsOptional()
  @IsInt()
  readonly listId?: number;
}
