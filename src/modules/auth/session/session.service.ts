import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma';
import { AccessTokenPayload, CreateSessionInput, IssueTokens, SessionTokenPayload } from './types';
import { SessionEntity, UserEntity } from '@/common/types';
import { FingerPrint } from '@dilanjer/fingerprint';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async createTokensAndSession({ fingerprint, user, isFirstSession }: CreateSessionInput): Promise<IssueTokens> {
    const session = isFirstSession ? await this.create({ fingerprint, user }) : await this.findOneOrCreate({ fingerprint, user });
    const tokens = this.createTokens(user, session, fingerprint);

    return tokens;
  }

  async findOne(sessionWhereUniqueInput: Prisma.SessionWhereUniqueInput) {
    return await this.prisma.session.findUnique({ where: sessionWhereUniqueInput });
  }

  async delete(sessionWhereUniqueInput: Prisma.SessionWhereUniqueInput): Promise<SessionEntity | null> {
    return await this.prisma.session.delete({ where: sessionWhereUniqueInput }).catch(() => null);
  }

  private async create({ fingerprint, user }: CreateSessionInput): Promise<SessionEntity> {
    const { id: fingerprintId, ...fingerprintRest } = fingerprint;
    const fingerprintData = JSON.stringify(fingerprintRest);

    return this.prisma.session.create({
      data: {
        fingerprintId,
        fingerprintData,
        user: { connect: { id: user.id } },
      },
    });
  }

  private async findOneOrCreate({ fingerprint, user }: CreateSessionInput): Promise<SessionEntity | null> {
    const { id: fingerprintId, ...fingerprintRest } = fingerprint;
    const fingerprintData = JSON.stringify(fingerprintRest);
    const session = await this.prisma.session.findFirst({
      where: {
        userId: user.id,
        fingerprintId,
        fingerprintData,
      },
    });

    if (!session) {
      //TODO: send email for pattern if this is a new entry point
      this.logger.debug(`New session created for userId=${user.id}, fingerprintId=${fingerprint.id}`);
      return await this.create({ fingerprint, user });
    }

    return session;
  }

  private createTokens(user: UserEntity, session: SessionEntity, fingerprint: FingerPrint): IssueTokens {
    const accessPayload: AccessTokenPayload = {
      id: user.id,
      email: user.email,
    };

    const sessionPayload: SessionTokenPayload = {
      fpId: fingerprint.id,
      usId: user.id,
      seId: session.id,
    };

    const access_token = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });

    const session_token = this.jwtService.sign(sessionPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SESSION_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_SESSION_TOKEN_EXPIRES_IN'),
    });

    return {
      session_token,
      access_token,
    };
  }
}
