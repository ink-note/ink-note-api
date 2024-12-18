import { createId } from '@paralleldrive/cuid2';
import { Injectable, Logger } from '@nestjs/common';

import { nullIfEmpty } from '@/shared/utils/array';
import { PrismaService } from '@/common/services/prisma';
import { CacheService } from '../../cache/cache.service';
import { UserService } from '../../user/user.service';
import { TotpService } from '../../totp/totp.service';
import { MfaEntity, MfaTemporary, UserEntity } from '../../types';

import {
  CreateTemporarySessionInput,
  FindManyWithUserIdInput,
  FindOneTemporarySessionInput,
  GenerateCacheKeyContext,
  GenerateCacheKeyInput,
} from './types';
import { Config } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { DURATIONS } from '@/kernel/constants/durations';

@Injectable()
export class TotpMfaService {
  private readonly logger = new Logger(TotpMfaService.name);
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
    private readonly userService: UserService,
    private readonly totpService: TotpService,
  ) {}

  public async findManyWithUserId({ userId }: FindManyWithUserIdInput): Promise<MfaEntity[] | null> {
    const mfaList = await this.prismaService.mfa.findMany({ where: { userId } });

    if (nullIfEmpty(mfaList)) {
      return null;
    }

    return mfaList;
  }

  async verifyEnroll() {}

  public async createTemporaryEntity(email: string): Promise<MfaTemporary> {
    this.logger.log(`Initiating creation of temporary MFA entity for email: ${email}`);

    try {
      // Fetch user by email
      const user = await this.userService.findOneWithEmail({ email });
      if (!user) {
        this.logger.warn(`No user found with email: ${email}`);
        throw new Error('User not found');
      }

      this.logger.log(`User found: ${user.id} (${user.email})`);

      // Check the count of TOTP type entities
      const totpTypeCount = await this.prismaService.mfa.count({ where: { type: 'TOTP' } });
      this.logger.log(`Current TOTP count for user: ${totpTypeCount}`);

      if (totpTypeCount > 2) {
        this.logger.warn(`TOTP limit exceeded for user: ${user.id}`);
        throw new Error('TOTP limit exceeded');
      }

      // Generate a unique MFA ID
      const id = createId();
      this.logger.log(`Generated temporary MFA ID: ${id}`);

      // Generate TOTP details
      const appName = this.configService.getOrThrow('MFA_APP_NAME');
      const { qrCodeUrl, secret } = await this.totpService.createTOTPDetails(appName, user.email);
      this.logger.log(`TOTP details generated for user: ${user.id}`);

      // Cache the TOTP secret with a TTL
      const cacheKey = this.generateCacheKey(id);
      await this.cacheService.set(cacheKey, secret, DURATIONS.ENTITIES.MFA_ENTITY_TEMPORARY_CACHE_TTL);
      this.logger.log(`TOTP secret cached with key: ${cacheKey}`);

      this.logger.log(`Temporary MFA entity successfully created for user: ${user.id}`);
      return { id, secret, qrCodeUrl };
    } catch (error) {
      this.logger.error(`Failed to create temporary MFA entity for email: ${email}`, error.stack);
      throw error;
    }
  }

  private async findOneTemporarySession({}: FindOneTemporarySessionInput) {}

  private async createTemporarySession({}: CreateTemporarySessionInput) {}

  private generateCacheKey(id: string, context?: GenerateCacheKeyContext): string {
    switch (context) {
      case 'session': {
        return this.cacheService.generateKey('mfa', 'session', id);
      }
      case 'temporary': {
        return this.cacheService.generateKey('mfa', 'temporary', id);
      }
      default: {
        return this.cacheService.generateKey('mfa', 'cache', id);
      }
    }
  }
}
