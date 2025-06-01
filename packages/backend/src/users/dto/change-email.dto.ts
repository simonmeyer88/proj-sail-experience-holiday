import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  newEmail: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  emailVerificationCode: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  password: string;
}
