import { ForbiddenException } from '@nestjs/common';
import { NextFunction } from 'express';
import { CsrfMiddleware } from './csrf.middleware';
import { Request, Response } from 'express';

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new CsrfMiddleware();
    req = {
      header: jest.fn(),
    } as any;
    res = {} as any;
    next = jest.fn();
  });

  it('should throw ForbiddenException if x-csrf-protection header is missing', () => {
    expect(() => middleware.use(req, res, next)).toThrowError(
      ForbiddenException,
    );
  });

  it('should call next() if x-csrf-protection header is present', () => {
    req.header = jest.fn().mockReturnValue('some-value');
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
