import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as IUser } from '@prisma/client';

export const User = createParamDecorator<keyof Omit<IUser, 'password'>>(
  (data: keyof Omit<IUser, 'password'>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: Omit<IUser, 'password'> = request.user;

    return data ? user?.[data] : user;
  },
);
