import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LogSnagService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  logSnagUrl = 'https://api.logsnag.com/v1/log';

  config = {
    project: this.configService.get<string | undefined>('LOG_SNAG_PROJECT'),
    apiKey: this.configService.get<string | undefined>('LOG_SNAG_API_KEY'),
    active: this.configService.get<boolean>('LOG_SNAG_ACTIVE', false),
  };

  /**
   * Logs an event to LogSnag.
   *
   * @param event - The event to log.
   * @param description - A description of the event.
   * @param channel - The channel the event occurred on.
   * @param userIdentifier - The identifier of the user who caused the event (email, id, etc.)
   */
  public async log(
    event: string,
    description: string,
    channel: string,
    userIdentifier: string,
  ) {
    if (!this.config.active) {
      return;
    }
    if (!this.config.project || !this.config.apiKey) {
      Logger.error('LogSnag is not configured correctly');
      return;
    }
    const opts = {
      method: 'post',
      maxBodyLength: Infinity,
      url: this.logSnagUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.config.apiKey,
      },
    };

    const body = {
      project: this.config.project,
      channel,
      event,
      description,
      user_id: userIdentifier,
    };

    try {
      await this.httpService.axiosRef.post(opts.url, body, {
        headers: opts.headers,
      });
    } catch (err) {
      Logger.error(err);
    }
  }
}
