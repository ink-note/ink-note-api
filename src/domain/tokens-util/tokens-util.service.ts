import { FingerPrint } from '@dilanjer/fingerprint';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenPayload, IssueTokens, SessionTokenPayload } from './types';
import { SessionEntity, UserEntity } from '../types';
import { ACCESS_TOKEN_DURATION, MFA_TEMPORARY_LOGIN_TOKEN_DURATION, SESSION_TOKEN_DURATION } from './constants';

@Injectable()
export class TokensUtilService {
  private readonly logger = new Logger(TokensUtilService.name);

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  verifyAccessToken(token: string): AccessTokenPayload {
    this.logger.log('Verifying access token');

    return this.jwtService.verify<AccessTokenPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  verifySessionToken(token: string): SessionTokenPayload {
    this.logger.log('Verifying session token');

    return this.jwtService.verify<SessionTokenPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_SESSION_TOKEN_SECRET'),
    });
  }

  verifyTemporaryLoginToken(token: string): { userId: string } {
    this.logger.log('Verifying temporary login token');

    return this.jwtService.verify<{ userId: string }>(token, {
      secret: this.configService.getOrThrow<string>('JWT_MFA_TEMPORARY_LOGIN_TOKEN_SECRET'),
    });
  }

  createTemporaryLoginToken(userId: string) {
    this.logger.log(`Creating temporary login token for user ID: ${userId}`);

    const temporaryPayload = { userId };

    const token = this.jwtService.sign(temporaryPayload, {
      secret: this.configService.getOrThrow<string>('JWT_MFA_TEMPORARY_LOGIN_TOKEN_SECRET'),
      expiresIn: MFA_TEMPORARY_LOGIN_TOKEN_DURATION,
    });

    return token;
  }

  createTokens(user: UserEntity, session: SessionEntity, fingerprint: FingerPrint): IssueTokens {
    this.logger.log(`Creating tokens for user ID: ${user.id}, Session ID: ${session.id}, Fingerprint ID: ${fingerprint.id}`);

    // Create access token
    const access_token = this.createAccessToken(user);
    this.logger.log(`Access token created for user ID: ${user.id}`);

    // Create session token
    const session_token = this.createSessionToken(user, session, fingerprint);
    this.logger.log(`Session token created for user ID: ${user.id}, Session ID: ${session.id}`);

    return { session_token, access_token };
  }

  createAccessToken(user: UserEntity): string {
    this.logger.log(`Creating access token for user ID: ${user.id}`);

    const accessPayload: AccessTokenPayload = {
      id: user.id,
      email: user.email,
    };

    const token = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: ACCESS_TOKEN_DURATION,
    });

    this.logger.log(`Access token created successfully for user ID: ${user.id}`);
    return token;
  }

  createSessionToken(user: UserEntity, session: SessionEntity, fingerprint: FingerPrint): string {
    this.logger.log(
      `Creating session token for user ID: ${user.id}, Session ID: ${session.id}, Fingerprint ID: ${fingerprint.id}`,
    );

    const sessionPayload: SessionTokenPayload = {
      fpId: fingerprint.id,
      usId: user.id,
      seId: session.id,
    };

    const token = this.jwtService.sign(sessionPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SESSION_TOKEN_SECRET'),
      expiresIn: SESSION_TOKEN_DURATION,
    });

    this.logger.log(`Session token created successfully for user ID: ${user.id}, Session ID: ${session.id}`);
    return token;
  }
}
