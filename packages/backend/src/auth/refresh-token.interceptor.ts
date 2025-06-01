import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { User } from '@prisma/client';

/**
 * Interceptor use to refresh the user JWT token in the cookie
 * after each request
 */
@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  constructor(private authService: AuthService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const response: Response = context.switchToHttp().getResponse();

    const request: Request = context.switchToHttp().getRequest();

    const user = request.user as User;
    if (!user) {
      return next.handle();
    }

    await this.authService.setAuthCookie(response, {
      userId: user.id,
      email: user.email,
    });

    return next.handle();
  }
}
