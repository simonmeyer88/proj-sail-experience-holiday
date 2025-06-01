import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { PASSWORD_REGEX } from '@aula-anclademia/common';

export class ResetPasswordDto {
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  token: string;

  @IsNotEmpty()
  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password is too weak. It must contain at least an uppercase letter, a lowercase letter, a number, be at least 8 characters long, and at most 64 characters long.',
  })
  @Transform(({ value }: { value: string }) => value.trim())
  newPassword: string;
}
