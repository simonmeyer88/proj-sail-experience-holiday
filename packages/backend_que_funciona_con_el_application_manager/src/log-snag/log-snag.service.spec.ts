import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogSnagService } from './log-snag.service';

describe('LogSnagService', () => {
  let service: LogSnagService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  const setMocks = (active: boolean) => {
    httpService = {
      axiosRef: {
        post: jest.fn(),
      },
    } as any;

    configService = {
      get: jest.fn().mockImplementation((key) => {
        switch (key) {
          case 'LOG_SNAG_PROJECT':
            return 'test-project';
          case 'LOG_SNAG_API_KEY':
            return 'test-api-key';
          case 'LOG_SNAG_ACTIVE':
            return active;
        }
      }),
    } as any;

    service = new LogSnagService(httpService, configService);
  };

  it('should log an event if active', async () => {
    setMocks(true);
    const event = 'test-event';
    const description = 'test-description';
    const channel = 'test-channel';
    const userIdentifier = 'test-user';

    await service.log(event, description, channel, userIdentifier);

    expect(httpService.axiosRef.post).toHaveBeenCalledWith(
      'https://api.logsnag.com/v1/log',
      {
        project: 'test-project',
        channel,
        event,
        description,
        user_id: userIdentifier,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-api-key',
        },
      },
    );
  });

  it('should not log an event if not active', async () => {
    setMocks(false);
    const event = 'test-event';
    const description = 'test-description';
    const channel = 'test-channel';
    const userIdentifier = 'test-user';

    await service.log(event, description, channel, userIdentifier);

    expect(httpService.axiosRef.post).not.toHaveBeenCalled();
  });
});
