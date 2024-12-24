import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from '@/domain/tokens-util/types';
import { UserService } from '@/domain/user/user.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOneById({ id: payload.id });
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.userService.prepareUserProfileData(user);
  }
}
