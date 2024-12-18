import { PrismaService } from '@/common/services/prisma';
import { MfaData, MfaEntity } from '@/common/types';
import { Pick } from '@/shared/utils/object';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { UserService } from '@/modules/user/user.service';
import { nullIfEmpty } from '@/shared/utils/array';
import {
  CreateTemporaryTokenInput,
  GenerateMfaCacheKey,
  TemporaryMfaInCache,
  MfaFindManyInput,
  MfaFindUniqueInput,
} from './types';
import { CacheService } from '@/common/services/cache';
import { toMs } from 'ms-typescript';
import { createId } from '@paralleldrive/cuid2';
import { totpUtils } from '@/shared/utils/totp';
import { ConfigService } from '@nestjs/config';
import { UserType } from '../types';
import { VerifyEnrollDto } from './dtos/Verify-enroll.dto';
import { MESSAGES } from '@/shared/constants/messages/en-EN';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async findManyMfaEntries(mfaFindManyInput: MfaFindManyInput): Promise<MfaEntity[] | null> {
    return nullIfEmpty(await this.prisma.mfa.findMany(mfaFindManyInput));
  }

  async createTemporaryMfaToken(userUniqueInput: CreateTemporaryTokenInput): Promise<string> {
    const token = nanoid(64);

    await this.cacheService.set(this.generateMfaCacheKey(userUniqueInput), token, toMs('5m'));

    return token;
  }

  async createTemporaryMfa(user: UserType): Promise<{ mfaSettingsId: string; authCode: string; qrCode: string }> {
    const totpCount = await this.prisma.mfa.count({
      where: { type: 'TOTP', userId: user.id },
    });

    if (totpCount > 2) {
      throw new BadRequestException('TOTP limit exceeded');
    }

    const id = createId();
    const mfaTOTP = await totpUtils.generateMfaDetails(
      this.configService.get<string>('TWO_FACTOR_AUTHENTICATION_APP_NAME'),
      user.email,
      10,
    );

    await this.cacheService.set<TemporaryMfaInCache>(
      this.generateMfaCacheKey({ tempMfaId: id }),
      { id, totp: mfaTOTP },
      toMs('10m'),
    );

    return {
      mfaSettingsId: id,
      authCode: mfaTOTP.secretKey,
      qrCode: mfaTOTP.qrCodeUrl,
    };
  }

  async verifyEnrollMfa(user: UserType, data: VerifyEnrollDto): Promise<boolean> {
    const { code, friendlyName, id } = data;

    const mfa = await this.cacheService.get<TemporaryMfaInCache>(this.generateMfaCacheKey({ tempMfaId: id }));

    if (!mfa) {
      throw new BadRequestException('MFA session not found');
    }

    if (!totpUtils.verifyOtpToken(code, mfa.totp.secretKey)) {
      throw new BadRequestException('Incorrect TOTP');
    }

    await this.cacheService.del(this.generateMfaCacheKey({ tempMfaId: id }));

    await this.prisma.mfa.create({
      data: {
        friendlyName,
        enabled: true,
        id,
        qrCodeUrl: mfa.totp.qrCodeUrl,
        secret: mfa.totp.secretKey,
        type: 'TOTP',
        enabledAt: new Date(),
        user: { connect: { id: user.id } },
      },
    });

    const mfaOptions = await this.findManyMfaEntries({ where: { userId: user.id } });

    if (!mfaOptions || !mfaOptions.some((option) => option.type === 'BACKUP_CODES')) {
      await this.prisma.mfa.create({
        data: {
          friendlyName: 'BACKUP_CODES',
          enabled: true,
          type: 'BACKUP_CODES',
          enabledAt: new Date(),
          user: { connect: { id: user.id } },
        },
      });
    }

    return true;
  }

  getMfaPublicData(mfa: MfaEntity): MfaData {
    return Pick(mfa, ['enabled', 'friendlyName', 'type', 'id', 'createdAt']);
  }

  private async findOne(mfaFindUniqueInput: MfaFindUniqueInput) {
    return await this.prisma.mfa.findUnique(mfaFindUniqueInput);
  }

  private generateMfaCacheKey(mfaCacheKey: GenerateMfaCacheKey): string {
    if (mfaCacheKey.userId) {
      return `mfa:userId:${mfaCacheKey.userId}`;
    }
    if (mfaCacheKey.email) {
      return `mfa:userEmail:${mfaCacheKey.email}`;
    }

    if (mfaCacheKey.tempMfaId) {
      return `mfa:temporary:${mfaCacheKey.tempMfaId}`;
    }

    throw new Error('Invalid mfaCacheKey: no sufficient unique identifiers provided.');
  }
}
