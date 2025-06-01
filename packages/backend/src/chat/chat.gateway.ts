import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';
import { CustomSocket } from './chat.types';
import { ConfigService } from '@nestjs/config';
import { UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NewMessageEvent } from 'src/event-emitter/chat';
import { ChatEvents } from 'src/event-emitter/enums';
import { AuthService } from 'src/auth/auth.service';
import { WsJwtGuard } from 'src/auth/ws-auth.guard';

@WebSocketGateway({
  transport: ['websocket', 'polling'],
  cors: {
    origin: [process.env.CORS_ORIGIN_1, process.env.CORS_ORIGIN_2],
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
@UsePipes(
  new ValidationPipe({
    forbidNonWhitelisted: true,
    whitelist: true,
  }),
)
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @WebSocketServer()
  server: Server;

  private async disconnectClient(client: CustomSocket, reason: string) {
    client.send({
      //@ts-ignore
      message: reason,
      error: true,
    });

    client.disconnect(true);
  }
  public async handleConnection(client: CustomSocket) {
    try {
      const authCookieName =
        this.configService.getOrThrow<string>('AUTH_COOKIE_NAME');

      const cookieStr = client.handshake.headers.cookie
        ?.split(';')
        .find((c) => c.trim().startsWith(`${authCookieName}=`));

      if (!cookieStr) return this.disconnectClient(client, 'No cookie found');

      // Manually parse cookie
      const parser = cookieParser(
        this.configService.getOrThrow<string>('COOKIE_SECRET'),
      );

      const req = {
        headers: {
          cookie: cookieStr,
        },
      } as any;

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      parser(req, {} as any, () => {});

      const authToken = req.signedCookies[authCookieName];

      const userId = await this.authService.getUserIdFromJwt(authToken);

      if (!userId) return this.disconnectClient(client, 'Invalid token');

      // Check if user exists
      await this.usersService.findOneById(userId);

      client.data = {
        authToken: authToken,
        userId,
      };
    } catch (e) {
      this.disconnectClient(client, 'Unknown error');
    }
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() deleteMessageDto: DeleteMessageDto,
    @ConnectedSocket() client: CustomSocket,
  ) {
    const userId = client.data.userId;

    const deleted = await this.chatService.deleteMessage(
      deleteMessageDto.id,
      userId,
    );

    const chat = await this.chatService.findOneById(deleted.chatId);

    const loggedInUserId = client.data.userId;

    const userIds = chat.users.map((user) => user.userId);

    if (!userIds.includes(loggedInUserId)) {
      throw new Error('User not in chat');
    }

    const socketsToNotify = this.chatService.getSocketsToNotify(
      this.server,
      userIds,
    );

    const messageDeleted = {
      id: deleted.id,
      chatId: deleted.chatId,
    };

    socketsToNotify.forEach((userSocket) => {
      this.server.to(userSocket.socketId).emit('deleteMessage', messageDeleted);
    });
  }

  @SubscribeMessage('message')
  async handleMessageSent(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: CustomSocket,
  ) {
    const loggedInUserId = client.data.userId;

    const user = await this.usersService.findOneById(loggedInUserId);

    const chat = await this.chatService.findOneById(createMessageDto.chatId);

    if (!chat.users.map((user) => user.user.id).includes(loggedInUserId)) {
      throw new Error('User not in chat');
    }

    const socketsToNotify = this.chatService.getSocketsToNotify(
      this.server,
      chat.users.map((user) => user.user.id),
    );

    const message = await this.chatService.createMessage(
      createMessageDto,
      loggedInUserId,
    );

    const messageSent = {
      id: message.id,
      chatId: message.chatId,
      content: message.content,
      sender: {
        id: message.sender.id,
        fullName: `${user.firstName} ${user.lastName}`,
        pictureUrl: user.pictureUrl,
      },
      sentAt: message.sentAt,
      deletedAt: message.deletedAt,
    };

    socketsToNotify.forEach((userSocket) => {
      this.server.to(userSocket.socketId).emit('message', messageSent);
    });

    this.eventEmitter.emit(
      ChatEvents.NEW_MESSAGE,
      new NewMessageEvent(message.id),
    );
  }
}
