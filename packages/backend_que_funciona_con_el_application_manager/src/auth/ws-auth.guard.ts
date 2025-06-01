import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from './auth.service';
import { CustomSocket } from 'src/chat/chat.types';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<CustomSocket>();
      const authToken = client?.data.authToken;
      const userId = client?.data.userId;
      if (!authToken || !userId) {
        return false;
      }
      const jwtUserId = await this.authService.getUserIdFromJwt(authToken);
      if (jwtUserId !== userId) {
        return false;
      }
      return true;
    } catch (err) {
      throw new WsException((err as { message: string }).message);
    }
  }
}
