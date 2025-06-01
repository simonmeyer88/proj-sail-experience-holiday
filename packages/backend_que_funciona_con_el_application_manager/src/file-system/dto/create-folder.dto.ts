import { IsString, MaxLength, MinLength } from 'class-validator';
import { STR_MAX_LENGTH, STR_MIN_LENGTH } from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class CreateFolderDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  name: string;
}
