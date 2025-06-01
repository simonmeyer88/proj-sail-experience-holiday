import { IsBoolean } from 'class-validator';

export class UpdateWaitlistDto {
  @IsBoolean()
  join: boolean;
}
