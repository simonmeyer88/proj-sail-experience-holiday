import { IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '@aula-anclademia/common';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @Matches(PASSWORD_REGEX, {
    message:
      'Password is too weak. It must contain at least an uppercase letter, a lowercase letter, a number, be at least 8 characters long, and at most 64 characters long.',
  })
  newPassword: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  oldPassword: string;
}
