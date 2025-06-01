import { ArrayNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  STR_MAX_LENGTH_MEDIUM,
  STR_MIN_LENGTH_MEDIUM,
} from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class CreateQuizDto {
  @IsString()
  @MinLength(STR_MIN_LENGTH_MEDIUM)
  @MaxLength(STR_MAX_LENGTH_MEDIUM)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString({ each: true })
  @ArrayNotEmpty()
  courseIds: string[];
}
