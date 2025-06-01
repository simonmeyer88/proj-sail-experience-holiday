import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const locale =
      (Array.isArray(request.headers['x-lang'])
        ? request.headers['x-lang'][0]
        : request.headers['x-lang']) || 'en';

    type ErrorResponse = {
      statusCode?: number;
      message?: string[] | string;
      error?: string;
    };

    const errorResponse = exception.getResponse() as ErrorResponse;

    const traslatedMessages = Array.isArray(errorResponse?.message)
      ? errorResponse?.message?.map((message) => {
          return this.i18n.translate(message, {
            lang: locale,
          });
        })
      : this.i18n.translate(errorResponse?.message || '', {
          lang: locale,
        });

    Logger.error(exception);
    response.status(status).json({
      message:
        traslatedMessages ||
        errorResponse?.message ||
        errorResponse?.error ||
        'Internal server error',
      statusCode: status,
    });
  }
}
