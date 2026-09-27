import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
} from 'class-validator';

export class UpdateListDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  readonly title?: string;

  @IsOptional()
  @IsInt()
  readonly position?: number;
}
