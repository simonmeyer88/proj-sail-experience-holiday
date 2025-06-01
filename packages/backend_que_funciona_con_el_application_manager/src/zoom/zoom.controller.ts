import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  RawBodyRequest,
} from '@nestjs/common';
import { ZoomService } from './zoom.service';
import { Body, Post } from '@nestjs/common';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { Auth } from 'src/auth/auth.decorator';
import {
  ZoomBodyMeetingCreated,
  ZoomBodyMeetingDeleted,
  ZoomBodyUrlValidation,
} from './zoom.interface';
import { ZoomMeetingResponse } from './response/zoom-meeting.response';

// In order to set up the Zoom webhook, visit their documentation.
// We handle the 'meeting.created', 'meeting.deleted', and 'meeting.ended' events.
// Additionally, we handle the 'endpoint.url_validation' event to validate the webhook (required by Zoom).
@Controller('zoom')
export class ZoomController {
  constructor(private readonly zoomService: ZoomService) {}

  // This endpoint is used to handle incoming webhooks from Zoom.
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Body()
    body:
      | ZoomBodyMeetingCreated
      | ZoomBodyMeetingDeleted
      | ZoomBodyUrlValidation,
    @Req() req: RawBodyRequest<Request>,
  ) {
    await this.zoomService.validateWebhook(req);

    switch (body.event) {
      case 'endpoint.url_validation':
        const validationRes = this.zoomService.handleUrlValidation(body);
        return validationRes;
      case 'meeting.created':
        await this.zoomService.handleMeetingCreated(body);
        break;
      case 'meeting.deleted':
        await this.zoomService.handleMeetingDeleted();
        break;
      case 'meeting.ended':
        await this.zoomService.handleMeetingDeleted();
        break;
      default:
        throw new BadRequestException('Invalid event type');
    }
  }

  // Just for the frontend to get the current meeting.
  @Auth('ADMIN', 'TEACHER', 'STUDENT')
  @Get('meeting')
  public async getCurrentMeeting(): Promise<ZoomMeetingResponse> {
    return this.zoomService.getCurrentMeeting();
  }
}
