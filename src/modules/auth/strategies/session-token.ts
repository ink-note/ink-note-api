import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { SessionService } from '../session/session.service';
import { Request } from 'express';
import { UserService } from '@/modules/user/user.service';
import { COOKIES } from '@/shared/constants/enums/cookies';
import { SessionTokenPayload } from '../session/types';
import { CurrentUserSession } from './types';

@Injectable()
export class SessionTokenStrategy extends PassportStrategy(Strategy, 'jwt-session') {
  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SESSION_TOKEN_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => this.SessionTokenFromRequest(req)]),
    });
  }

  private SessionTokenFromRequest(req: Request): string | null {
    const token: string = req.cookies[COOKIES.SESSION_TOKEN];

    if (!token) {
      return null;
    }

    return token;
  }

  async validate(req: Request, { usId, seId, fpId }: SessionTokenPayload): Promise<CurrentUserSession> {
    const _fpId = req.cookies[COOKIES.FINGERPRINT_ID];

    if (_fpId !== fpId) {
      this.removeCookies(req);
      throw new UnauthorizedException();
    }

    const session = await this.sessionService.findOne({ id: seId });
    if (!session) {
      this.removeCookies(req);
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({ id: usId });
    if (!user) {
      this.removeCookies(req);
      throw new UnauthorizedException();
    }

    return { user, session };
  }

  private removeCookies(req: Request) {
    req.res.cookie(COOKIES.ACCESS_TOKEN, '', { maxAge: 0 });
    req.res.cookie(COOKIES.SESSION_TOKEN, '', { maxAge: 0 });
    req.res.cookie(COOKIES.FINGERPRINT_ID, '', { maxAge: 0 });
  }
}
