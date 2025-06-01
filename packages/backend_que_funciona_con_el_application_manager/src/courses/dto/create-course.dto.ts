import { IsString, MaxLength, MinLength } from 'class-validator';
import { STR_MAX_LENGTH, STR_MIN_LENGTH } from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @Transform(({ value }: { value: string }) => value.trim())
  name: string;
}
