import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from 'src/users/users.module';
import { ChatController } from './chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { WebPushModule } from 'src/web-push/web-push.module';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [UsersModule, JwtModule, WebPushModule],
  controllers: [ChatController],
})
export class ChatModule {}
