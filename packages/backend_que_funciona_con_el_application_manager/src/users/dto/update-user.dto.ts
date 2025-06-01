import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  MinDate,
  MaxDate,
} from 'class-validator';
import { STR_MAX_LENGTH, STR_MIN_LENGTH } from '@aula-anclademia/common';

export class UpdateUserDto {
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  firstName: string;

  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  lastName: string;

  @Transform(({ value }) => value.replaceAll(' ', ''))
  @IsString()
  @IsPhoneNumber()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  phoneNumber: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  // birthDate must be older than 16 years
  @MaxDate(() => new Date(Date.now() - 16 * 365 * 24 * 60 * 60 * 1000), {
    message: 'users.AT_LEAST_16_YEARS',
  })
  birthDate: Date;

  @Transform(({ value }) => value.trim())
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @IsOptional()
  address: string;

  @Transform(({ value }) => value.trim())
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @IsOptional()
  zipCode: string;

  @Transform(({ value }) => value.trim())
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @IsOptional()
  city: string;

  @Transform(({ value }) => value.trim())
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @IsOptional()
  idNumber: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  // idIssueDate must be before today
  @MaxDate(() => new Date(), {
    message: 'users.ID_BEFORE_TODAY',
  })
  // idIssueDate must be newer than 10 years ago
  @MinDate(() => new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000), {
    message: 'users.ID_LAST_10_YEARS',
  })
  @IsOptional()
  idIssueDate: Date;

  @IsString()
  @IsOptional()
  courseId: string;

  @IsBoolean()
  @IsOptional()
  isInClub: boolean;
}
