import {
  Injectable,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';
import { DatabaseService } from './../database/database.service';
import {
  ZoomBodyMeetingCreated,
  ZoomBodyUrlValidation,
} from './zoom.interface';

/**
 * Handles Zoom logic, mainly webhooks
 * The intended functionality is to only have one Zoom meeting at a time, and display
 *  that meeting + its join url on the frontend
 */
@Injectable()
export class ZoomService {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Cryptographically validate the webhook request from Zoom
   * @param req raw request from express
   */
  public async validateWebhook(req: RawBodyRequest<Request>) {
    const signature = req.headers['x-zm-signature'];
    const timestamp = req.headers['x-zm-request-timestamp'];
    const body = req.rawBody.toString();

    const secret = this.configService.getOrThrow<string>('ZOOM_WEBHOOK_SECRET');

    const message = 'v0:' + timestamp + ':' + body;

    const hashedMessage = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    const hashDigest = 'v0=' + hashedMessage;

    // check if sent values are cryptographically signed by Zoom with our secret
    if (hashDigest !== signature) {
      throw new UnauthorizedException();
    }
  }

  /**
   * Used for Zoom to validate our endpoint
   * @param body raw request body from express
   *
   */
  public handleUrlValidation(body: ZoomBodyUrlValidation) {
    const plainToken = body.payload.plainToken;
    // Generate HMAC SHA-256 hash
    const secret = this.configService.getOrThrow<string>('ZOOM_WEBHOOK_SECRET');
    const hash = crypto
      .createHmac('sha256', secret)
      .update(plainToken)
      .digest('hex');

    return {
      plainToken: plainToken,
      encryptedToken: hash,
    };
  }

  /**
   * Handle the creation of a Zoom meeting
   * @param body The body of the Zoom webhook request
   * @returns The created meeting object
   */
  public async handleMeetingCreated(body: ZoomBodyMeetingCreated) {
    const meetingId = body.payload.object.id;
    const joinUrl = body.payload.object.join_url;

    // since we only want one meeting at a time, delete all existing meetings to keep the latest one
    await this.databaseService.zoomMeeting.deleteMany({});
    await this.databaseService.zoomMeeting.create({
      data: {
        meetingId: meetingId.toString(),
        joinUrl: joinUrl,
      },
    });
  }

  /**
   * Handle the deletion of a Zoom meeting
   * @param body The body of the Zoom webhook request
   */
  public async handleMeetingDeleted() {
    await this.databaseService.zoomMeeting.deleteMany({});
  }

  /**
   * Get the current Zoom meeting
   * @returns The current Zoom meeting or null if there is none
   */
  public async getCurrentMeeting() {
    const meeting = await this.databaseService.zoomMeeting.findFirst();
    return meeting;
  }
}
