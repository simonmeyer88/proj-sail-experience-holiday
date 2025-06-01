import {
  ArrayMinSize,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { STR_MAX_LENGTH, STR_MIN_LENGTH } from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class CreateGroupChatDto {
  @IsString()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  name: string;

  // This DTO is received using multipart/form-data, and NestJS somehow calls transform 2 times.
  // Our objective is returning an array of strings, so we need to handle in which it comes as a string or as an array.
  @IsString({ each: true })
  @IsOptional()
  @ArrayMinSize(1)
  @Transform(({ value }: { value: string | string[] }) => {
    try {
      return Array.isArray(value) ? value : JSON.parse(value);
    } catch (e) {
      return [];
    }
  })
  userIds?: string[];
}
