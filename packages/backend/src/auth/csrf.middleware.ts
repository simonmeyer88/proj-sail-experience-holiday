import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly csrfCsrf: any;
  use(req: Request, _res: Response, next: NextFunction) {
    const xCsrfHeader = req.header('x-csrf-protection');
    if (!xCsrfHeader) {
      throw new ForbiddenException('Missing CSRF header');
    }
    next();
  }
}
