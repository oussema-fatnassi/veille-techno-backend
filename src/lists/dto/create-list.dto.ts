import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateListDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly title: string;

  @IsOptional()
  @IsInt()
  readonly position?: number;
}
