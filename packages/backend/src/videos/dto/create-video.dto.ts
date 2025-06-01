import {
  ArrayMinSize,
  IsDate,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { STR_MAX_LENGTH, STR_MIN_LENGTH } from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class CreateVideoDto {
  @IsUrl()
  @Transform(({ value }: { value: string }) => value.trim())
  url: string;

  @IsString()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @Transform(({ value }: { value: string }) => value.trim())
  title: string;

  @IsString({ each: true })
  @ArrayMinSize(1)
  courseIds: string[];

  @IsDate()
  @Transform(({ value }: { value: Date }) => new Date(value))
  date: Date;
}
