import { Module } from '@nestjs/common';
import { WebPushService } from './web-push.service';
import { WebPushController } from './web-push.controller';
import { WebpushEventHandler } from './web-push.event-handler';
import { LogSnagModule } from '../log-snag/log-snag.module';

@Module({
  providers: [WebPushService, WebpushEventHandler],
  controllers: [WebPushController],
  exports: [WebPushService],
  imports: [LogSnagModule],
})
export class WebPushModule {}
