import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NewMessageEvent } from 'src/event-emitter/chat';
import { WebPushService } from './web-push.service';
import { DatabaseService } from 'src/database/database.service';
import { EventEvents } from 'src/event-emitter/enums';
import { EventCreatedEvent } from 'src/event-emitter/events/event-created.event';
import { WebPushSubscriptionType } from './web-push.types';
@Injectable()
export class WebpushEventHandler {
  constructor(
    private readonly webPushService: WebPushService,
    private readonly databaseService: DatabaseService,
  ) {}
  @OnEvent('chat.newMessage')
  async newMessage(payload: NewMessageEvent) {
    const message = await this.databaseService.message.findUnique({
      where: {
        id: payload.messageId,
      },
      include: {
        sender: true,
        chat: {
          include: {
            users: true,
          },
        },
      },
    });

    const subscriptions = (
      await this.webPushService.getActiveSubscriptionsForUsers(
        message.chat.users.map((relation) => relation.userId),
        WebPushSubscriptionType.CHAT,
      )
    ).filter((subscription) => subscription.userId !== message.sender.id);

    await this.webPushService.sendNotification(subscriptions, {
      type: 'chat',
      title: `${message.sender.firstName} ${message.sender.lastName}`,
      body: message.content,
      data: {
        chatId: message.chatId,
      },
    });
  }

  @OnEvent(EventEvents.EVENT_CREATED)
  async eventCreated(payload: EventCreatedEvent) {
    const courses = await this.databaseService.course.findMany({
      where: {
        predefinedEvents: {
          some: {
            predefinedEvent: {
              events: {
                some: {
                  id: payload.eventId,
                },
              },
            },
          },
        },
      },
      include: {
        students: {
          select: {
            id: true,
          },
        },
      },
    });

    const userIds = courses.flatMap((course) =>
      course.students.map((student) => student.id),
    );

    const subscriptions =
      await this.webPushService.getActiveSubscriptionsForUsers(
        userIds,
        WebPushSubscriptionType.CALENDAR,
      );

    const event = await this.databaseService.event.findUniqueOrThrow({
      where: {
        id: payload.eventId,
      },
      include: {
        predefinedEvent: true,
      },
    });

    await this.webPushService.sendNotification(subscriptions, {
      type: 'calendar',
      title: 'Nuevo evento disponible',
      body: event.isClub ? event.title : event.predefinedEvent.title,
      data: {
        eventId: payload.eventId,
      },
    });
  }
}
