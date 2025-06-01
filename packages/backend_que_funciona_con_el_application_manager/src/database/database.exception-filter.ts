import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpServer,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export type ErrorCodesStatusMapping = {
  [key: string]: number;
};

export type ErrorCodesMessageMapping = {
  [key: string]: (target: string) => string;
};

/**
 * {@link PrismaClientExceptionFilter} catches {@link Prisma.PrismaClientKnownRequestError} exceptions.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private errorCodesStatusMapping: ErrorCodesStatusMapping = {
    P2000: HttpStatus.BAD_REQUEST,
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
    // This error is for transactions (deadlocks)
    P2034: HttpStatus.BAD_REQUEST,
  };

  private errorCodesMessage: ErrorCodesMessageMapping = {
    P2000: (target: string) => 'VALUE_TOO_LONG_' + target,
    P2002: (target: string) => 'DUPLICATE_VALUE_' + target,
    P2025: (target: string) => 'NOT_FOUND_' + target,
    // Happens on transaction deadlocks
    P2034: (_target: string) => 'GENERAL_ERROR',
  } as const;

  constructor(applicationRef?: HttpServer) {
    super(applicationRef);
  }

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    return this.catchClientKnownRequestError(exception, host);
  }

  private catchClientKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    if (exception.code === 'P2034') {
      const ctx = host.switchToHttp();
      const request = ctx.getRequest<Request>();

      const locale =
        (Array.isArray(request.headers['x-lang'])
          ? request.headers['x-lang'][0]
          : request.headers['x-lang']) || 'en';

      const message =
        locale === 'en'
          ? 'There was an error. Please try again.'
          : 'Hubo un error. Por favor, inténtelo de nuevo.';
      return super.catch(
        new HttpException(
          { statusCode: HttpStatus.BAD_REQUEST, message },
          HttpStatus.BAD_REQUEST,
        ),
        host,
      );
    }

    if (!Object.keys(this.errorCodesStatusMapping).includes(exception.code)) {
      return super.catch(exception, host);
    }

    const statusCode = this.errorCodesStatusMapping[exception.code];

    const baseStr = this.errorCodesMessage[exception.code](
      (exception.meta?.target as string) || '',
    );

    const message = baseStr;

    return super.catch(
      new HttpException({ statusCode, message }, statusCode),
      host,
    );
  }
}
