import { IsString, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  password: string;
}
