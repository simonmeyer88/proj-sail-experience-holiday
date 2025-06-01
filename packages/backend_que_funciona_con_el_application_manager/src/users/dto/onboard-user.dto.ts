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
import {
  STR_MAX_LENGTH,
  STR_MIN_LENGTH,
} from '@aula-anclademia/common/validation-constants';

abstract class OnboardUserDto {
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @Transform(({ value }) => value.trim())
  firstName: string;

  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @Transform(({ value }) => value.trim())
  lastName: string;

  @Transform(({ value }) => value.replaceAll(' ', '').trim())
  @IsPhoneNumber()
  @IsString()
  phoneNumber: string;
}
export class OnboardTeacherDto extends OnboardUserDto {}
export class OnboardStudentDto extends OnboardUserDto {
  @Transform(({ value }) => new Date(value))
  @IsDate()
  // birthDate must be older than 16 years
  @IsDate()
  @MaxDate(
    () => new Date(new Date().getTime() - 16 * 365 * 24 * 60 * 60 * 1000),
    {
      message: 'users.AT_LEAST_16_YEARS',
    },
  )
  birthDate: Date;

  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @Transform(({ value }) => value.trim())
  address: string;

  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @Transform(({ value }) => value.trim())
  zipCode: string;

  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @Transform(({ value }) => value.trim())
  city: string;

  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @IsString()
  @Transform(({ value }) => value.trim())
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
  idIssueDate: Date;

  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value === '' ||
    value === undefined ||
    value === null ||
    value === 'null' ||
    value === 'undefined'
      ? null
      : value,
  )
  courseId: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  joinClub: boolean;
}
