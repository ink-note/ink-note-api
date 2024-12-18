import { FingerPrint } from '@dilanjer/fingerprint';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenPayload, IssueTokens, SessionTokenPayload } from './types';
import { SessionEntity, UserEntity } from '../types';
import { DURATIONS } from '../constants/durations';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  public createTokens(user: UserEntity, session: SessionEntity, fingerprint: FingerPrint): IssueTokens {
    this.logger.log(`Creating tokens for user ID: ${user.id}, Session ID: ${session.id}, Fingerprint ID: ${fingerprint.id}`);

    // Create access token
    const access_token = this.createAccessToken(user);
    this.logger.log(`Access token created for user ID: ${user.id}`);

    // Create session token
    const session_token = this.createSessionToken(user, session, fingerprint);
    this.logger.log(`Session token created for user ID: ${user.id}, Session ID: ${session.id}`);

    return { session_token, access_token };
  }

  public createAccessToken(user: UserEntity): string {
    this.logger.log(`Creating access token for user ID: ${user.id}`);

    const accessPayload: AccessTokenPayload = {
      id: user.id,
      email: user.email,
    };

    this.logger.debug(`Access token payload: ${JSON.stringify(accessPayload)}`);

    const token = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: DURATIONS.TOKENS.ACCESS_TOKEN_DURATION,
    });

    this.logger.log(`Access token created successfully for user ID: ${user.id}`);
    return token;
  }

  public createSessionToken(user: UserEntity, session: SessionEntity, fingerprint: FingerPrint): string {
    this.logger.log(
      `Creating session token for user ID: ${user.id}, Session ID: ${session.id}, Fingerprint ID: ${fingerprint.id}`,
    );

    const sessionPayload: SessionTokenPayload = {
      fpId: fingerprint.id,
      usId: user.id,
      seId: session.id,
    };

    this.logger.debug(`Session token payload: ${JSON.stringify(sessionPayload)}`);

    const token = this.jwtService.sign(sessionPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SESSION_TOKEN_SECRET'),
      expiresIn: DURATIONS.TOKENS.SESSION_TOKEN_DURATION,
    });

    this.logger.log(`Session token created successfully for user ID: ${user.id}, Session ID: ${session.id}`);
    return token;
  }
}
