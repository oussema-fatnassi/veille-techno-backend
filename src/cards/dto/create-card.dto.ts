import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly title: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsOptional()
  @IsInt()
  readonly position?: number;
}
