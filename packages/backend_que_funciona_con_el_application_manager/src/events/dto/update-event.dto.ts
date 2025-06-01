import { PickType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
import { STR_MIN_LENGTH, STR_MAX_LENGTH } from '@aula-anclademia/common';

export class UpdateEventDto extends PickType(CreateEventDto, [
  'endDate',
  'startDate',
  'description',
  'totalSlots',
  'enableBooking',
  'color',
]) {
  // Will only be used if the event is a club event
  @IsOptional()
  @MinLength(STR_MIN_LENGTH)
  @MaxLength(STR_MAX_LENGTH)
  title?: string;
}
