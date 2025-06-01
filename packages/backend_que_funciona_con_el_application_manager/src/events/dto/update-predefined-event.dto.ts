import { CreatePredefinedEventDto } from './create-predefined-event.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePredefinedEventDto extends PartialType(
  CreatePredefinedEventDto,
) {}
