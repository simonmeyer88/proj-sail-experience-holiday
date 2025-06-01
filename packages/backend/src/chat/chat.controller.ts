import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseInterceptors,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  Delete,
  Logger,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { User } from 'src/auth/user.decorator';
import { User as IUser } from '@prisma/client';
import { Auth } from 'src/auth/auth.decorator';
import { AddMembersDto } from './dto/add-members.dto';
import { Param } from '@nestjs/common';
import { IMessage } from './chat.types';

import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_PROFILEPIC_FILE_SIZE } from '@aula-anclademia/common';
import { CreatePrivateChatDto } from './dto/create-private-chat.dto';
import { DeleteMembersDto } from './dto/delete-members.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Auth()
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_DAY_AT_4AM
      : CronExpression.EVERY_5_SECONDS,
  )
  async cleanUpOrphanedGroupChatPics() {
    const deleted = await this.chatService.deleteOrphanedGroupChatPictures();
    Logger.log(`Deleted ${deleted} orphaned group chat pictures`);
  }

  @Auth('ADMIN', 'TEACHER')
  @UseInterceptors(FileInterceptor('image'))
  @Post('/groups')
  public async createGroup(
    @Body() createGroupChatDto: CreateGroupChatDto,
    @User() user: IUser,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PROFILEPIC_FILE_SIZE }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return await this.chatService.createGroupChat(
      createGroupChatDto,
      user.id,
      image,
    );
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Post('/private')
  createPrivateChat(@Body() dto: CreatePrivateChatDto, @User() user: IUser) {
    return this.chatService.createPrivateChat({
      creatorId: user.id,
      otherUserId: dto.userId,
    });
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get()
  findAll(@User() user: IUser) {
    return this.chatService.findAllChatsByUserId(user.id);
  }

  @Auth('ADMIN', 'TEACHER')
  @Post(':id/members')
  addMembers(
    @Body() addMembersDto: AddMembersDto,
    @Param('id') chatId: string,
  ) {
    return this.chatService.addMembers(chatId, addMembersDto.memberIds);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete(':id/members')
  removeMembers(
    @Body() dto: DeleteMembersDto,
    @Param('id') chatId: string,
    @User() user: IUser,
  ) {
    return this.chatService.removeMembers(chatId, dto.memberIds, user.id);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get(':id/members')
  getMembers(@Param('id') chatId: string) {
    return this.chatService.getChatMembers(chatId);
  }

  @Auth('ADMIN', 'TEACHER')
  @Delete(':id')
  delete(@Param('id') chatId: string) {
    return this.chatService.deleteGroupChat(chatId);
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get(':id/messages')
  async getMessages(
    @Param('id') chatId: string,
    @Query('idCursor') idCursor: string,
  ): Promise<IMessage[]> {
    const LIMIT = 10;

    const messages = await this.chatService.getMessages(
      chatId,
      idCursor,
      LIMIT,
    );

    return messages;
  }

  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Post(':id/see')
  public async seeChat(@Param('id') chatId: string, @User() user: IUser) {
    return this.chatService.seeChat(chatId, user.id);
  }
}
