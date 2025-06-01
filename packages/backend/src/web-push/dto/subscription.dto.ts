import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PushSubscriptionKeys {
  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}

class PushSubscription {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @Type(() => PushSubscriptionKeys)
  @ValidateNested()
  keys: PushSubscriptionKeys;

  @IsOptional()
  expirationTime?: number;
}

export class SubscriptionDto {
  @Type(() => PushSubscription)
  @ValidateNested()
  subscription: PushSubscription;

  @IsBoolean()
  chatEnabled: boolean;

  @IsBoolean()
  calendarEnabled: boolean;
}

export class GetStatusDto {
  @Type(() => PushSubscription)
  @ValidateNested()
  subscription: PushSubscription;
}
