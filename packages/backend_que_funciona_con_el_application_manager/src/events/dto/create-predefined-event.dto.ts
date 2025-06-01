import { ArrayNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { STR_MAX_LENGTH, STR_MIN_LENGTH } from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class CreatePredefinedEventDto {
  @IsString()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @Transform(({ value }) => value.trim())
  title: string;

  @IsString({ each: true })
  @ArrayNotEmpty()
  courseIds: string[];
}
