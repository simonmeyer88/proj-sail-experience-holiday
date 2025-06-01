import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  text: string;

  @IsString()
  chatId: string;
}
