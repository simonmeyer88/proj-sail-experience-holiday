import { PaymentMethod, PaymentType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsIn(['STRIPE', 'CASH', 'WOOCOMMERCE', 'CARD', 'EFECTIVO'])
  method: PaymentMethod;

  @IsIn(['SUBSCRIPTION', 'ONE_TIME'])
  type: PaymentType;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  paidAt: Date;

  @IsString()
  @IsOptional()
  description?: string;
}
