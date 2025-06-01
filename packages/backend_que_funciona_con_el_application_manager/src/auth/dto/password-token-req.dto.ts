import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
export class PasswordTokenReqDto {
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;
}
