import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

import { exclude } from 'src/common/exclude';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private databaseService: DatabaseService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req && req.signedCookies) {
          return req.signedCookies[configService.get('AUTH_COOKIE_NAME')];
        }
        return null;
      },
      // TODO - not use proccess.env
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      jsonWebTokenOptions: {
        ignoreNotBefore: false,
      },
    });
  }

  async validate(payload: any) {
    const id = payload.sub;
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.isActive) {
      throw new UnauthorizedException();
    }

    const userWithoutPassword = exclude(user, ['password']);
    return userWithoutPassword;
  }
}
