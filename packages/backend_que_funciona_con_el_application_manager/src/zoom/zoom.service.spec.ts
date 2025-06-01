import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './../database/database.service';
import { ZoomService } from './zoom.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import {
  ZoomBodyMeetingCreated,
  ZoomBodyUrlValidation,
} from './zoom.interface';
import * as crypto from 'crypto';

describe('ZoomService', () => {
  let zoomService: ZoomService;
  let configService: ConfigService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ZoomService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            zoomMeeting: {
              deleteMany: jest.fn(),
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    zoomService = moduleRef.get<ZoomService>(ZoomService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  describe('validateWebhook', () => {
    it('should throw UnauthorizedException if signature is invalid', async () => {
      const req = {
        headers: {
          'x-zm-signature': 'invalid_signature',
        },
        rawBody: Buffer.from('request_body'),
      };

      jest.spyOn(configService, 'getOrThrow').mockReturnValue('webhook_secret');

      await expect(
        zoomService.validateWebhook(req as unknown as Request),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('handleUrlValidation', () => {
    it('should return plainToken and encryptedToken', () => {
      const body = {
        payload: {
          plainToken: 'plain_token',
        },
      };

      jest.spyOn(configService, 'getOrThrow').mockReturnValue('webhook_secret');

      const result = zoomService.handleUrlValidation(
        body as unknown as ZoomBodyUrlValidation,
      );

      const plainToken = body.payload.plainToken;
      // Generate HMAC SHA-256 hash
      const secret = 'webhook_secret';
      const hash = crypto
        .createHmac('sha256', secret)
        .update(plainToken)
        .digest('hex');

      expect(result).toEqual({
        plainToken: 'plain_token',
        encryptedToken: hash,
      });
    });
  });

  describe('handleMeetingCreated', () => {
    it('should delete existing meetings and create a new meeting', async () => {
      const body = {
        payload: {
          object: {
            id: 'meeting_id',
            join_url: 'join_url',
          },
        },
      };

      await zoomService.handleMeetingCreated(
        body as unknown as ZoomBodyMeetingCreated,
      );

      expect(databaseService.zoomMeeting.deleteMany).toHaveBeenCalled();
      expect(databaseService.zoomMeeting.create).toHaveBeenCalledWith({
        data: {
          meetingId: 'meeting_id',
          joinUrl: 'join_url',
        },
      });
    });
  });

  describe('handleMeetingDeleted', () => {
    it('should delete all meetings', async () => {
      await zoomService.handleMeetingDeleted();

      expect(databaseService.zoomMeeting.deleteMany).toHaveBeenCalled();
    });
  });

  describe('getCurrentMeeting', () => {
    it('should return the current meeting', async () => {
      const meeting = { id: 'meeting_id', join_url: 'join_url' };
      jest
        .spyOn(databaseService.zoomMeeting, 'findFirst')
        .mockResolvedValue(meeting as any);

      const result = await zoomService.getCurrentMeeting();

      expect(result).toEqual(meeting);
    });
  });
});
