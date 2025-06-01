import { Transform } from 'class-transformer';

import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinDate,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  EVENT_MAX_SLOTS,
  EVENT_MIN_SLOTS,
  STR_MIN_LENGTH,
  STR_MAX_LENGTH,
  STR_MAX_LENGTH_LONG,
  STR_MIN_LENGTH_LONG,
} from '@aula-anclademia/common';
import { IsAfterProperty } from 'src/common/validation-decorators';
import { RecurrenceRule } from '../events.service';

export class CreateEventDto {
  @IsBoolean()
  isClub: boolean;

  @IsString()
  @ValidateIf((o) => !o.isClub)
  predefinedEventId?: string;

  @IsString()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  @ValidateIf((o) => o.isClub)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(STR_MIN_LENGTH_LONG)
  @MaxLength(STR_MAX_LENGTH_LONG)
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  enableBooking?: boolean;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(() => new Date(), {
    message: 'events.START_DATE_MUST_BE_IN_THE_FUTURE',
  })
  startDate: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  @MinDate(() => new Date(), {
    message: 'events.START_DATE_MUST_BE_IN_THE_FUTURE',
  })
  recurrenceEnd?: Date;

  @IsString()
  @IsOptional()
  recurrenceRule?: RecurrenceRule;

  @IsArray()
  @IsOptional()
  repeatDays?: number[];

  @Transform(({ value }) => value.map((v: string) => new Date(v)))
  @IsArray()
  @IsOptional()
  repeatDates?: Date[];

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsAfterProperty('startDate', {
    message: 'events.END_DATE_MUST_BE_AFTER_START_DATE',
  })
  endDate: Date;

  @IsNumber()
  @Max(EVENT_MAX_SLOTS)
  totalSlots: number;
}
