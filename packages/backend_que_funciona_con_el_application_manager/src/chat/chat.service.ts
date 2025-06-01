import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { DatabaseService } from 'src/database/database.service';
import { IMessage } from './chat.types';
import { UsersService } from 'src/users/users.service';
import { StorageService } from 'src/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Chat } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import { CreateMessageDto } from './dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  s3GroupPicturesFolder = 'chat-group-pictures';

  /**
   * Resizes the image to be stored in the database
   */
  private async buildGroupChatPicture(
    image: Express.Multer.File,
  ): Promise<Express.Multer.File> {
    const resizedImage = await sharp(image.buffer)
      .resize({ width: 150, height: 150 })
      .withMetadata()
      .toBuffer();

    // Create a new file object with the resized image
    const resizedFile: Express.Multer.File = {
      ...image,
      buffer: resizedImage,
      size: resizedImage.length,
    };

    return resizedFile;
  }

  /**
   * Given a chat + logged in user, returns the chat's picture URL
   * It depends in the user because if the chat is not a group, we need to return the other user's profile picture
   */
  private async getChatPictureUrl(chat: Chat, loggedInUserId: string) {
    if (!chat.isGroup) {
      // If chat is not a group, return the other user's profile picture
      const chatUsers = await this.databaseService.user.findMany({
        where: {
          chats: {
            some: {
              chatId: chat.id,
            },
          },
        },
      });

      const otherUser = chatUsers.find((user) => user.id !== loggedInUserId);

      return this.usersService.buildPictureUrl(
        otherUser?.profilePicturePath ?? null,
        otherUser?.id ?? null,
      );
    } else {
      if (!chat.pictureS3Key) {
        return null;
      }
      const s3Url = this.configService.getOrThrow('S3_PUBLIC_URL');

      return `${s3Url}/${chat.pictureS3Key}`;
    }
  }

  /**
   * Deletes all group chat pictures that are not referenced in the database
   * @returns The number of deleted pictures
   */
  public async deleteOrphanedGroupChatPictures() {
    const chats = await this.databaseService.chat.findMany({
      where: {
        isGroup: true,
      },
      select: {
        pictureS3Key: true,
      },
    });

    const allS3Keys = await this.storageService
      .listObjects({
        Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
        Prefix: this.s3GroupPicturesFolder,
      })
      .then((res) => res.Contents?.map((obj) => obj.Key));

    if (!allS3Keys || allS3Keys.length === 0) {
      return 0;
    }

    const s3KeysToDelete = allS3Keys.filter(
      (s3Key) => !chats.some((chat) => chat.pictureS3Key === s3Key),
    );

    if (s3KeysToDelete.length === 0) {
      return 0;
    }

    await this.storageService.deleteObjects({
      Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
      Delete: {
        Objects: s3KeysToDelete.map((s3Key) => ({ Key: s3Key })),
      },
    });

    return s3KeysToDelete.length;
  }

  /**
   * Fired when a user sees a chat. Updates the lastSeenAt field
   */
  public async seeChat(chatId: string, userId: string) {
    await this.databaseService.chatsOnUsers.update({
      where: {
        chatId_userId: {
          userId,
          chatId,
        },
      },
      data: {
        lastSeenAt: new Date(),
      },
    });
  }

  /**
   * Given a socket server and a list of user IDs, returns the sockets that should be notified of a message
   */
  public getSocketsToNotify(server: Server, userIds: string[]) {
    const userSocketPair = Array.from(server.sockets.sockets.values()).map(
      (socket) => {
        return {
          userId: socket.data.userId,
          socketId: socket.id,
        };
      },
    );

    const chatsToNotify = userSocketPair.filter((pair) => {
      return userIds.includes(pair.userId);
    });

    return chatsToNotify;
  }

  /**
   * Deletes a group chat
   * @param chatId
   */
  public async deleteGroupChat(chatId: string) {
    await this.databaseService.$transaction(async (tx) => {
      const chat = await tx.chat.findUniqueOrThrow({
        where: {
          id: chatId,
        },
      });

      // Can only delete group chats at the moment
      if (!chat.isGroup) {
        throw new BadRequestException('Chat is not a group. Cannot delete');
      }

      const s3Params: PutObjectCommandInput = {
        Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
        Key: chat.pictureS3Key,
      };

      // Only delete picture if chat has one -- otherwise this would throw an error
      if (s3Params.Key) {
        await this.storageService.deleteObject(s3Params);
      }

      // Delete all messages in the chat
      await tx.message.deleteMany({
        where: {
          chatId,
        },
      });

      // Finally, delete the chat
      await tx.chat.delete({
        where: {
          id: chatId,
        },
      });
    });
  }

  /**
   * Finds all chats of a user
   */
  public async findAllChatsByUserId(userId: string) {
    const chats = await this.databaseService.chat.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    const promises = chats.map(async (chat) => {
      const pictureUrl = await this.getChatPictureUrl(chat, userId);
      return {
        lastSeenAt: chat.users.find((relation) => relation.userId === userId)
          .lastSeenAt,
        id: chat.id,
        name: chat.isGroup
          ? chat.name
          : chat.users.find((relation) => relation.userId !== userId).user
              .firstName +
            ' ' +
            chat.users.find((relation) => relation.userId !== userId).user
              .lastName,
        pictureUrl,
        isGroup: chat.isGroup,
        otherUserId: chat.isGroup
          ? null
          : chat.users.find((relation) => relation.userId !== userId)?.user
              .id ?? null,
      };
    });

    return await Promise.all(promises);
  }

  /**
   * Finds a chat by its ID
   */
  public async findOneById(id: string) {
    return await this.databaseService.chat.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                id: true,
                profilePicturePath: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Creates a message
   */
  public async createMessage(
    createMessageDto: CreateMessageDto,
    senderId: string,
  ) {
    const message = await this.databaseService.message.create({
      data: {
        content: createMessageDto.text,
        chatId: createMessageDto.chatId,
        senderId,
      },
    });

    return {
      id: message.id,
      chatId: message.chatId,
      content: message.content,
      sender: {
        id: message.senderId,
      },
      sentAt: message.createdAt,
      deletedAt: message.deletedAt,
    };
  }

  /**
   * Finds messages in a chat.
   * @param chatId
   * @param idCursor The ID of the message to start from
   * @param limit The number of messages to return
   */
  public async getMessages(
    chatId: string,
    idCursor: string,
    limit = 10,
  ): Promise<IMessage[]> {
    const messages = await this.databaseService.message.findMany({
      take: limit,
      skip: idCursor ? 1 : 0,
      where: {
        chatId,
      },
      select: {
        deletedAt: true,
        createdAt: true,
        id: true,
        content: true,
        senderId: true,
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            id: true,
            profilePicturePath: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      cursor: idCursor
        ? {
            id: idCursor,
          }
        : undefined,
    });

    return messages.map((message) => ({
      id: message.id,
      chatId,
      content: message.content,
      sender: {
        id: message.senderId,
        fullName: `${message.sender.firstName} ${message.sender.lastName}`,
        pictureUrl: this.usersService.buildPictureUrl(
          message.sender.profilePicturePath,
          message.sender.id,
        ),
      },
      sentAt: message.createdAt,
      deletedAt: message.deletedAt,
    }));
  }

  /**
   * Creates a group chat, optionally a list of users can be passed to be added to the chat
   */
  public async createGroupChat(
    createChatDto: CreateGroupChatDto,
    creatorId: string,
    image: Express.Multer.File,
  ) {
    const createdChat = await this.databaseService.$transaction(async (tx) => {
      image = await this.buildGroupChatPicture(image);

      const s3Params: PutObjectCommandInput = {
        Bucket: this.configService.getOrThrow('S3_PUBLIC_BUCKET_NAME'),
        Key: `${this.s3GroupPicturesFolder}/${uuidv4()}`,
        Body: image.buffer,
      };

      await this.storageService.putObject(s3Params);

      const createManyData = [
        {
          userId: creatorId,
        },
        ...(createChatDto.userIds?.map((userId) => ({
          userId,
        })) ?? []),
      ];
      return tx.chat.create({
        data: {
          isGroup: true,
          pictureS3Key: s3Params.Key,
          name: createChatDto.name,
          users: {
            createMany: {
              data: createManyData,
            },
          },
        },
      });
    });

    return {
      id: createdChat.id,
    };
  }

  /**
   * Creates a private chat between 2 users
   */
  public async createPrivateChat({
    creatorId,
    otherUserId,
  }: {
    creatorId: string;
    otherUserId: string;
  }) {
    if (creatorId === otherUserId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }
    const already = await this.databaseService.chat.findFirst({
      where: {
        AND: [
          {
            isGroup: false,
          },
          {
            users: {
              some: {
                userId: creatorId,
              },
            },
          },
          {
            users: {
              some: {
                userId: otherUserId,
              },
            },
          },
        ],
      },
    });

    if (already) {
      throw new BadRequestException('Chat already exists');
    }

    await this.databaseService.chat.create({
      data: {
        isGroup: false,
        users: {
          createMany: {
            data: [
              {
                userId: creatorId,
              },
              {
                userId: otherUserId,
              },
            ],
          },
        },
        name: '__private__' + creatorId + '__' + otherUserId,
      },
    });
  }

  /**
   * Adds members to a group chat
   * If some user is already a member, it is ignored
   * @throws BadRequestException if chat is not a group
   */
  public async addMembers(chatId: string, memberIds: string[]) {
    const chat = await this.databaseService.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        users: true,
      },
    });

    if (!chat) {
      throw new BadRequestException('Chat not found');
    }

    if (!chat.isGroup) {
      throw new BadRequestException('Chat is not a group');
    }

    const alreadyMemberIds = chat.users.map((relation) => relation.userId);

    await this.databaseService.chat.update({
      where: {
        id: chatId,
      },
      data: {
        users: {
          createMany: {
            data: [
              ...memberIds
                .filter((memberId) => !alreadyMemberIds.includes(memberId))
                .map((memberId) => ({
                  userId: memberId,
                })),
            ],
          },
        },
      },
    });
  }

  /**
   * Removes members from a group chat
   * If some user is not a member, it is ignored
   * @param chatId The ID of the chat
   * @param memberIds The IDs of the members to remove
   * @param authedUserId The ID of the user that is removing the members
   * @throws BadRequestException if chat is not a group
   * @throws BadRequestException if authedUserId is in memberIds
   * @throws BadRequestException if authedUserId is not in the chat
   */
  public async removeMembers(
    chatId: string,
    memberIds: string[],
    authedUserId: string,
  ) {
    // Not allowed to remove yourself
    if (memberIds.includes(authedUserId)) {
      throw new BadRequestException('Cannot remove yourself');
    }

    // Not allowed to remove if you are not in the chat
    const isMember = await this.databaseService.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            userId: authedUserId,
          },
        },
      },
    });

    if (!isMember) {
      throw new ForbiddenException(
        'Cannot remove members. You are not in chat',
      );
    }

    const chat = await this.databaseService.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
      include: {
        users: true,
      },
    });

    if (!chat.isGroup) {
      throw new BadRequestException(
        'Chat is not a group. Cannot remove members',
      );
    }

    const alreadyMemberIds = chat.users.map((relation) => relation.userId);

    await this.databaseService.chat.update({
      where: {
        id: chatId,
      },
      data: {
        users: {
          deleteMany: {
            userId: {
              in: memberIds.filter((memberId) =>
                alreadyMemberIds.includes(memberId),
              ),
            },
          },
        },
      },
    });
  }

  /**
   * Finds all members of a group chat
   */
  public async getChatMembers(chatId: string) {
    return await this.usersService.findAllBasicInfo({
      chats: {
        some: {
          chatId,
        },
      },
    });
  }

  /**
   * Deletes a message
   */
  public async deleteMessage(messageId: string, userId: string) {
    // Verify that user is the sender of the message
    const message = await this.databaseService.message.findFirst({
      where: {
        id: messageId,
        sender: {
          id: userId,
        },
      },
    });

    if (!message) {
      throw new ForbiddenException('Cannot delete message. You are not sender');
    }

    // Verify that the message is not already deleted
    if (message.deletedAt) {
      throw new ConflictException('Message was already deleted');
    }

    // Verify that the user is still in the chat
    const chat = await this.databaseService.chat.findFirstOrThrow({
      where: {
        id: message.chatId,
        users: {
          some: {
            userId,
          },
        },
      },
    });

    if (!chat) {
      throw new ForbiddenException(
        'Cannot delete message. You are not in the chat',
      );
    }

    return await this.databaseService.message.update({
      where: {
        id: messageId,
      },
      data: {
        deletedAt: new Date(),
        content: '',
      },
    });
  }
}
