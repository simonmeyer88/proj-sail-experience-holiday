import { IsString, MaxLength, MinLength } from 'class-validator';
import { STR_MIN_LENGTH, STR_MAX_LENGTH } from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class UpdateFolderDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  name: string;
}
