import { Transform } from 'class-transformer';
import { IsString, IsEmail, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '@aula-anclademia/common';
export class RegisterDto {
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  emailVerificationCode: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password is too weak. It must contain at least an uppercase letter, a lowercase letter, a number, be at least 8 characters long, and at most 64 characters long.',
  })
  @Transform(({ value }: { value: string }) => value.trim())
  password: string;
}
