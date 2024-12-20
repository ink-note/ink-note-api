import { Injectable, Logger } from '@nestjs/common';
import { FingerPrint } from '@dilanjer/fingerprint';

import { PrismaService } from '@/common/services/prisma';
import {
  CreateSessionInput,
  FindFirstByIdAndUserIdInput,
  FindOneByIdInput,
  FingerprintData,
  SessionCacheOperationsOptions,
} from './types';
import { SessionEntity } from '../types';
import { CacheService } from '@/common/services/cache';
import { SESSION_ENTITY_CACHE_TTL, SESSION_ENTITY_DURATION_ISO } from './constants';
import { EntityBase } from '../entity-base.service';

@Injectable()
export class SessionService extends EntityBase {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prismaService: PrismaService,
    readonly cacheService: CacheService,
  ) {
    super(cacheService);
  }

  public async findOneById({ id }: FindOneByIdInput, options: SessionCacheOperationsOptions = {}): Promise<SessionEntity | null> {
    const currentOptions = this.processOptions({ ...options, cacheTTL: SESSION_ENTITY_CACHE_TTL });

    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Finding session with ID: ${id}, Cache Key: ${cacheKey}`);

    return this.handleCache<SessionEntity | null>(cacheKey, currentOptions, async () => {
      this.logger.log(`Fetching session from database for ID: ${id}`);
      const session = await this.prismaService.session.findUnique({ where: { id } });

      if (!session) {
        this.logger.warn(`Session with ID: ${id} not found in database.`);
        return null;
      }

      return session;
    });
  }

  public async findFirstByIdAndUserId(
    { id, userId }: FindFirstByIdAndUserIdInput,
    options: SessionCacheOperationsOptions = {},
  ): Promise<SessionEntity | null> {
    const currentOptions = this.processOptions({ ...options, cacheTTL: SESSION_ENTITY_CACHE_TTL });

    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Starting session lookup. ID: ${id}, User ID: ${userId}, Cache Key: ${cacheKey}`);

    return this.handleCache(cacheKey, currentOptions, async () => {
      this.logger.log(`Session not found in cache. Fetching from database. ID: ${id}, User ID: ${userId}`);
      const session = await this.prismaService.session.findFirst({ where: { id, userId } });

      if (!session) {
        this.logger.log(`Session not found in cache. Fetching from database. ID: ${id}, User ID: ${userId}`);
        return null;
      }

      return session;
    });
  }

  public async deleteOneById(id: string): Promise<boolean> {
    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Attempting to delete session By ID: ${id}, Cache Key: ${cacheKey}`);

    try {
      // Deleting session from the database
      const session = await this.prismaService.session.delete({ where: { id } });

      if (session) {
        this.logger.log(`Session with ID: ${id} deleted from the database. Clearing cache for: ${cacheKey}`);
        // Deleting the session from cache
        await this.cacheService.del(cacheKey);
        return true;
      } else {
        this.logger.warn(`Session with ID: ${id} not found for deletion.`);
        return false;
      }
    } catch (error) {
      // Log the error if something goes wrong during the deletion process
      this.logger.error(`Error deleting session with ID: ${id}`, error.stack);
    }
  }

  public async createNewOrFindSession({ fingerprint, user, isInitialSession }: CreateSessionInput): Promise<SessionEntity> {
    if (isInitialSession) {
      return await this.create({ fingerprint, user });
    }

    let session = await this.findFirstByIdAndUserId({ id: fingerprint.id, userId: user.id });

    if (!session) {
      session = await this.create({ fingerprint, user });
    }

    return session;
  }

  private async create({ fingerprint, user }: CreateSessionInput): Promise<SessionEntity> {
    this.logger.log(`Starting session creation for user ID: ${user.id}`);

    // Prepare fingerprint data
    const { fingerprintData, fingerprintId } = this.prepareFingerprintData(fingerprint);
    this.logger.log(`Fingerprint data prepared for user ID: ${user.id}, Fingerprint ID: ${fingerprintId}`);

    try {
      // Create session in the database
      const session = await this.prismaService.session.create({
        data: {
          fingerprintId,
          fingerprintData,
          user: { connect: { id: user.id } },
          expiresAt: SESSION_ENTITY_DURATION_ISO,
        },
      });

      this.logger.log(`Session created successfully for user ID: ${user.id}, Session ID: ${session.id}`);
      return session;
    } catch (error) {
      // Log any errors during session creation
      this.logger.error(`Error creating session for user ID: ${user.id}`, error.stack);
      throw error; // Rethrow the error to ensure proper error handling
    }
  }

  private prepareFingerprintData(fingerprint: FingerPrint): FingerprintData {
    const { id: fingerprintId, ...fingerprintRest } = fingerprint;
    const fingerprintData = JSON.stringify(fingerprintRest);

    return { fingerprintData, fingerprintId };
  }

  private generateCacheKey(id: string): string {
    return this.getCacheKey('session', 'cache', id);
  }
}
