import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma';
import { AccessTokenPayload, CreateSessionInput, IssueTokens, SessionTokenPayload } from './types';
import { SessionEntity, UserEntity } from '@/common/types';
import { FingerPrint } from '@dilanjer/fingerprint';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { DURATIONS } from '@/shared/constants/enums/durations';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async createTokensAndSession({ fingerprint, user, isFirstSession }: CreateSessionInput): Promise<IssueTokens> {
    const session = isFirstSession
      ? await this.createSession({ fingerprint, user })
      : await this.handleNewOrExistingSession({ fingerprint, user });

    return this.generateTokens(user, session, fingerprint);
  }

  async findOne(sessionWhereUniqueInput: Prisma.SessionWhereUniqueInput) {
    return this.prisma.session.findUnique({ where: sessionWhereUniqueInput });
  }

  async delete(sessionWhereUniqueInput: Prisma.SessionWhereUniqueInput): Promise<SessionEntity | null> {
    try {
      return await this.prisma.session.delete({ where: sessionWhereUniqueInput });
    } catch {
      return null;
    }
  }

  private async createSession({ fingerprint, user }: CreateSessionInput): Promise<SessionEntity> {
    const { id: fingerprintId, ...fingerprintRest } = fingerprint;
    const fingerprintData = JSON.stringify(fingerprintRest);

    return this.prisma.session.create({
      data: {
        fingerprintId,
        fingerprintData,
        user: { connect: { id: user.id } },
        expiresAt: DURATIONS.SESSION_ENTITY_DURATION,
      },
    });
  }

  private async handleNewOrExistingSession({ fingerprint, user }: CreateSessionInput): Promise<SessionEntity> {
    const { id: fingerprintId, ...fingerprintRest } = fingerprint;
    const fingerprintData = JSON.stringify(fingerprintRest);

    let session = await this.prisma.session.findFirst({
      where: {
        userId: user.id,
        fingerprintId,
        fingerprintData,
      },
    });

    if (!session) {
      this.logger.verbose(`Creating new session for userId=${user.id}, fingerprintId=${fingerprint.id}`);

      // Detect new session and send email notification
      this.logger.verbose(`Sending notification email for new session to userId=${user.id}`);
      await this.sendNewSessionEmail(user.email);

      session = await this.createSession({ fingerprint, user });
    }

    return session;
  }

  private async sendNewSessionEmail(email: string): Promise<void> {
    // Logic to send an email notification about the new session
    this.logger.verbose(`Sending new session email to ${email}`);
    // Implement email service call here
  }

  private generateTokens(user: UserEntity, session: SessionEntity, fingerprint: FingerPrint): IssueTokens {
    const access_token = this.createAccessToken(user);
    const session_token = this.createSessionToken(user, session, fingerprint);

    return { session_token, access_token };
  }

  private createAccessToken(user: UserEntity): string {
    const accessPayload: AccessTokenPayload = {
      id: user.id,
      email: user.email,
    };

    return this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
  }

  private createSessionToken(user: UserEntity, session: SessionEntity, fingerprint: FingerPrint): string {
    const sessionPayload: SessionTokenPayload = {
      fpId: fingerprint.id,
      usId: user.id,
      seId: session.id,
    };

    return this.jwtService.sign(sessionPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SESSION_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_SESSION_TOKEN_EXPIRES_IN'),
    });
  }
}
