import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebPushSubscription } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as webPush from 'web-push';
import { LogSnagService } from './../log-snag/log-snag.service';
import { IWebPushEvent, WebPushSubscriptionType } from './web-push.types';
import { SubscriptionDto } from './dto/subscription.dto';

/**
 * Service for handling web push notifications.
 */
@Injectable()
export class WebPushService {
  webPush = webPush;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly logSnagService: LogSnagService,
  ) {
    this.webPush.setVapidDetails(
      this.configService.getOrThrow('VAPID_SUBJECT'),
      this.configService.getOrThrow('VAPID_PUBLIC_KEY'),
      this.configService.getOrThrow('VAPID_PRIVATE_KEY'),
    );
  }

  /**
   * Get the service worker registration.
   * Also, renews the subscription.
   * @returns The service worker registration.
   */
  public async getSubscriptionStatus(
    subscription: webPush.PushSubscription,
    userId: string,
  ) {
    const response = await this.databaseService.webPushSubscription.findFirst({
      where: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    if (!response) {
      return {
        chatEnabled: false,
        calendarEnabled: false,
      };
    }

    // Renew the subscription
    await this.databaseService.webPushSubscription.update({
      where: {
        endpoint: subscription.endpoint,
      },
      data: {
        updatedAt: new Date(),
      },
    });
    return {
      chatEnabled: response.chatEnabled,
      calendarEnabled: response.calendarEnabled,
    };
  }

  /**
   * Get the VAPID public key.
   * @returns The VAPID public key.
   */
  public getVapidPublicKey() {
    return this.configService.getOrThrow('VAPID_PUBLIC_KEY');
  }

  /**
   * Send a notification to multiple subscriptions.
   * @param subscriptions - The list of subscriptions to send the notification to.
   * @param title - The title of the notification.
   * @param body - The body of the notification.
   * @param data - Additional data to include in the notification.
   */
  public async sendNotification(
    subscriptions: webPush.PushSubscription[],
    { title, body, data, type }: IWebPushEvent,
  ) {
    let errors = 0;
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await this.webPush.sendNotification(
            subscription,
            JSON.stringify({ title, body, data, type }),
          );
        } catch (error: any) {
          const user = await this.databaseService.user.findFirst({
            where: {
              WebPushSubscription: {
                some: {
                  endpoint: subscription.endpoint,
                },
              },
            },
          });
          this.logSnagService.log(
            'WEB_PUSH_ERROR',
            `Failed to send web push notification. Error: ${error.body}. Subscription endpoint: ${subscription.endpoint}`,
            'web-push',
            user?.email,
          );
          errors++;
        }
      }),
    );
    if (errors > 0) {
      Logger.error(
        `Failed to send ${errors} notifications out of ${subscriptions.length}`,
      );
    }
  }

  /**
   * Receiving a dto with a subscription details + its options (chatEnabled, calendarEnabled),
   * update the subscription in the database, create a new one if needed or delete it if both options
   * are disabled.
   * @param dto - The subscription details.
   * @param userId - The ID of the user.
   */
  public async updateSubscription(
    dto: SubscriptionDto,
    userId: string,
  ): Promise<void> {
    const existingSubscription =
      await this.databaseService.webPushSubscription.findFirst({
        where: {
          endpoint: dto.subscription.endpoint,
        },
      });

    // Check auth (subscription keys). Do not check userId because multiple users can use the same device
    if (
      existingSubscription &&
      (existingSubscription.p256dh !== dto.subscription.keys.p256dh ||
        existingSubscription.auth !== dto.subscription.keys.auth)
    ) {
      throw new ForbiddenException("The authentication details don't match");
    }

    // If both options are false and there is an existing subscription, delete it
    if (existingSubscription && !dto.chatEnabled && !dto.calendarEnabled) {
      await this.databaseService.webPushSubscription.delete({
        where: {
          endpoint: dto.subscription.endpoint,
        },
      });
      return;
    }

    // If there is not an existing subscription, create one
    if (!existingSubscription) {
      await this.databaseService.webPushSubscription.create({
        data: {
          endpoint: dto.subscription.endpoint,
          p256dh: dto.subscription.keys.p256dh,
          auth: dto.subscription.keys.auth,
          userId,
          chatEnabled: dto.chatEnabled,
          calendarEnabled: dto.calendarEnabled,
        },
      });
      return;
    }

    // There is an existing subscription, but user is different
    // Then, delete the existing subscription and create a new one
    if (existingSubscription.userId !== userId) {
      await this.databaseService.webPushSubscription.delete({
        where: {
          endpoint: dto.subscription.endpoint,
        },
      });
      await this.databaseService.webPushSubscription.create({
        data: {
          endpoint: dto.subscription.endpoint,
          p256dh: dto.subscription.keys.p256dh,
          auth: dto.subscription.keys.auth,
          userId,
          chatEnabled: existingSubscription.chatEnabled,
          calendarEnabled: existingSubscription.calendarEnabled,
        },
      });
      return;
    }

    // There is an existing solution, but user is the same
    // Then, just update the subscription
    await this.databaseService.webPushSubscription.update({
      where: {
        endpoint: dto.subscription.endpoint,
      },
      data: {
        chatEnabled: dto.chatEnabled,
        calendarEnabled: dto.calendarEnabled,
      },
    });
  }

  /**
   * Build a PushSubscription object from a database object.
   * @param dbObject - The database object representing a subscription.
   * @returns The PushSubscription object.
   */
  public buildFromDatabase(dbObject: WebPushSubscription) {
    return {
      endpoint: dbObject.endpoint,
      keys: {
        p256dh: dbObject.p256dh,
        auth: dbObject.auth,
      },
      userId: dbObject.userId,
    };
  }

  /**
   * Get all subscriptions for a list of user IDs.
   * @param userIds - The list of user IDs.
   * @returns The list of active subscriptions (lastRenewedAt within session duration)
   */
  public async getActiveSubscriptionsForUsers(
    userIds: string[],
    type: WebPushSubscriptionType,
  ) {
    const sessionDurationMs = this.configService.getOrThrow(
      'AUTH_SESSION_DURATION_MS',
    );

    const subscriptions =
      await this.databaseService.webPushSubscription.findMany({
        where: {
          userId: {
            in: userIds,
          },
          // we use updatedAt as a way to know when the user last logged in from this device
          updatedAt: {
            gte: new Date(Date.now() - sessionDurationMs),
          },
          chatEnabled: type === WebPushSubscriptionType.CHAT ? true : undefined,
          calendarEnabled:
            type === WebPushSubscriptionType.CALENDAR ? true : undefined,
        },
      });
    return subscriptions.map((subscription) =>
      this.buildFromDatabase(subscription),
    );
  }

  /**
   * Delete all expired subscriptions.
   * @returns The number of deleted subscriptions.
   */
  public async deleteExpiredSubscriptions() {
    const sessionDurationMs = this.configService.getOrThrow(
      'AUTH_SESSION_DURATION_MS',
    );
    const subscriptions =
      await this.databaseService.webPushSubscription.findMany({
        where: {
          updatedAt: {
            lt: new Date(Date.now() - sessionDurationMs),
          },
        },
      });
    this.databaseService.webPushSubscription.deleteMany({
      where: {
        id: {
          in: subscriptions.map((subscription) => subscription.id),
        },
      },
    });
  }
}
