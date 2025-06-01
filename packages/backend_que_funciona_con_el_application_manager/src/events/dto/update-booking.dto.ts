import { IsBoolean } from 'class-validator';

export class UpdateBookingDto {
  @IsBoolean()
  book: boolean;
}
