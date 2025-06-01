import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class EmailVerificationCodeReqDto {
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;
}
