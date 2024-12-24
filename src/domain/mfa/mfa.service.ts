import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma';
import {
  CreateMfaTemporaryInput,
  CreateMfaTemporaryTOTPInput,
  CreateMfaTemporaryTOTPOutput,
  FindManyByUserId,
  VerifyEnrollTOTPInput,
  VerifyTOTPInput,
} from './types';
import { MFA_ENTITY_TEMPORARY_CACHE_TTL, MFA_TOTP_LIMIT } from './constants';
import { MfaData, MfaEntity } from '../types';
import { createId } from '@paralleldrive/cuid2';
import { TotpUtilService } from '../totp-util/totp-util.service';
import { ConfigService } from '@nestjs/config';
import { Pick } from '@/shared/utils/object';
import { MfaCacheHelperService } from './mfa-cache-helper.service';
import { CacheOperationsOptions } from '../helpers/types';
import { MfaBackupCodeService } from './mfa-backup-code.service';
import { nanoid } from 'nanoid';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly totpUtilService: TotpUtilService,
    private readonly prismaService: PrismaService,
    private readonly mfaCacheHelper: MfaCacheHelperService,
    private readonly mfaBackupCodeService: MfaBackupCodeService,
  ) {}

  prepareMfaOptionsData(mfaEntity: MfaEntity | MfaEntity[]): MfaData | MfaData[] {
    const mfaKeys: (keyof MfaEntity)[] = ['id', 'friendlyName', 'type', 'createdAt']; // Define valid keys explicitly

    if (!Array.isArray(mfaEntity)) {
      return Pick(mfaEntity, mfaKeys);
    }

    return mfaEntity.map((mfa) => Pick(mfa, mfaKeys));
  }

  async findManyByUserId({ userId }: FindManyByUserId, options: CacheOperationsOptions = {}): Promise<MfaEntity[] | null> {
    const cacheKey = this.mfaCacheHelper.constructCacheKey(userId);

    this.logger.log(`Fetching MFA options for userId: ${userId}, Cache Key: ${cacheKey}`);

    return this.mfaCacheHelper.fetchFromCacheOrDatabase<MfaEntity[] | null>(cacheKey, options, async () => {
      this.logger.log(`Retrieving MFA options from database for userId: ${userId}`);
      const mfaOptions = await this.prismaService.mfa.findMany({ where: { userId } });

      if (!mfaOptions.length) {
        this.logger.warn(`No MFA options found in database for userId: ${userId}`);
        return null;
      }

      return mfaOptions;
    });
  }

  async createTemporary({ userId, type }: CreateMfaTemporaryInput) {
    if (type === 'TOTP') {
      return this.createTemporaryTOTP({ userId });
    }

    throw new BadRequestException(`Unsupported MFA type: ${type}`);
  }

  async createTemporaryLoginSessionToken(userId: string) {
    const temporarySessionToken = nanoid();
    const cacheKey = this.mfaCacheHelper.constructTemporaryLoginSessionCacheKey(temporarySessionToken);

    await this.mfaCacheHelper.saveToCache(cacheKey, { userId }, MFA_ENTITY_TEMPORARY_CACHE_TTL);

    return temporarySessionToken;
  }

  async verifyTemporaryLoginSessionToken(temporarySessionToken: string) {
    const cacheKey = this.mfaCacheHelper.constructTemporaryLoginSessionCacheKey(temporarySessionToken);
    const temporaryData = await this.mfaCacheHelper.getFromCache<{ userId: string }>(cacheKey);

    if (!temporaryData) {
      throw new BadRequestException('Invalid temporary session token');
    }

    return temporaryData;
  }

  async verifyTOTP({ code, mfaSettingsId }: VerifyTOTPInput) {
    const mfaSettings = await this.prismaService.mfa.findUnique({ where: { id: mfaSettingsId } });

    if (!mfaSettings) {
      throw new BadRequestException('Invalid MFA ID');
    }

    const isValid = await this.totpUtilService.verifyTOTP(code, mfaSettings.secret);

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    return true;
  }

  async verifyEnrollTOTP({ code, userId, mfaSettingsId, friendlyName }: VerifyEnrollTOTPInput): Promise<boolean | string[]> {
    const cacheKey = this.mfaCacheHelper.constructTemporaryCacheKey(mfaSettingsId);
    const temporaryData = await this.mfaCacheHelper.getFromCache<CreateMfaTemporaryTOTPOutput>(cacheKey);

    if (!temporaryData) {
      throw new BadRequestException('Invalid MFA ID');
    }

    const { secret } = temporaryData;

    const isValid = await this.totpUtilService.verifyTOTP(code, secret);

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    await this.prismaService.mfa.create({
      data: {
        id: mfaSettingsId,
        userId,
        friendlyName,
        type: 'TOTP',
        secret,
      },
    });

    await this.mfaCacheHelper.clearCache(cacheKey);

    const hasBackupCodes = await this.prismaService.mfa.findFirst({ where: { userId, type: 'BACKUP_CODES' } });

    if (!hasBackupCodes) {
      const backupCodes = await this.mfaBackupCodeService.generateBackupCodes();
      await this.prismaService.mfa.create({
        data: {
          id: createId(),
          userId,
          type: 'BACKUP_CODES',
          backupCodes,
          secret: null,
        },
      });

      return backupCodes;
    }

    return true;
  }

  private async createTemporaryTOTP({ userId }: CreateMfaTemporaryTOTPInput): Promise<CreateMfaTemporaryTOTPOutput> {
    const existingTotpCount = await this.prismaService.mfa.count({ where: { userId, type: 'TOTP' } });

    if (existingTotpCount > MFA_TOTP_LIMIT) {
      throw new BadRequestException('MFA TOTP limit exceeded');
    }

    const id = createId();
    const { qrCodeUrl, secret } = await this.totpUtilService.createTOTPDetails(this.configService.get('MFA_APP_NAME'), userId);

    const cacheKey = this.mfaCacheHelper.constructTemporaryCacheKey(id);
    await this.mfaCacheHelper.saveToCache(cacheKey, { id, qrCodeUrl, secret, userId }, MFA_ENTITY_TEMPORARY_CACHE_TTL);

    return { id, qrCodeUrl, secret };
  }
}
