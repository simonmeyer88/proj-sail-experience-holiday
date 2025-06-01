import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupChatDto } from './create-group-chat.dto';

export class UpdateChatDto extends PartialType(CreateGroupChatDto) {
  id: number;
}
