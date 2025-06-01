import { IsString } from 'class-validator';

export class CreatePrivateChatDto {
  @IsString()
  userId: string;
}
