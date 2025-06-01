import { Controller, Post } from '@nestjs/common';
import { WebPushService } from './web-push.service';
import { Body } from '@nestjs/common';
import { User } from 'src/auth/user.decorator';
import { Auth } from 'src/auth/auth.decorator';
import { SubscriptionDto, GetStatusDto } from './dto/subscription.dto';
import { WebPushResponse } from './web-push.response';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('web-push')
export class WebPushController {
  constructor(private webPushService: WebPushService) {}

  @Cron(CronExpression.EVERY_HOUR)
  public async deleteExpiredSubscriptions() {
    await this.webPushService.deleteExpiredSubscriptions();
  }

  @Auth('TEACHER', 'STUDENT', 'ADMIN')
  @Post('vapid-public-key')
  public async getVapidPublicKey(): Promise<string> {
    return await this.webPushService.getVapidPublicKey();
  }

  @Auth('TEACHER', 'STUDENT', 'ADMIN')
  @Post('subscription')
  public async updateSubscription(
    @Body() body: SubscriptionDto,
    @User('id') userId: string,
  ): Promise<void> {
    await this.webPushService.updateSubscription(body, userId);
  }

  @Auth('TEACHER', 'STUDENT', 'ADMIN')
  @Post('subscription-status')
  public async getSubscriptionStatus(
    @Body() body: GetStatusDto,
    @User('id') userId: string,
  ): Promise<WebPushResponse> {
    const status = await this.webPushService.getSubscriptionStatus(
      body.subscription,
      userId,
    );
    return new WebPushResponse(status.chatEnabled, status.calendarEnabled);
  }
}
