import { Injectable, Logger } from '@nestjs/common';
import { FingerPrint } from '@dilanjer/fingerprint';

import { PrismaService } from '@/common/services/prisma';
import { CreateSessionInput, FindFirstByIdAndUserIdInput, FindOneByIdInput, FingerprintData } from './types';
import { SessionEntity } from '../types';
import { SESSION_ENTITY_DURATION_ISO } from './constants';
import { SessionCacheHelperService } from './session-cache-helper.service';
import { CacheOperationsOptions } from '../helpers/types';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionCacheHelperService: SessionCacheHelperService,
  ) {}

  async findOneById({ id }: FindOneByIdInput, options: CacheOperationsOptions = {}): Promise<SessionEntity | null> {
    const cacheKey = this.sessionCacheHelperService.constructCacheKey(id);
    this.logger.log(`Finding session with ID: ${id}, Cache Key: ${cacheKey}`);

    return await this.sessionCacheHelperService.fetchFromCacheOrDatabase<SessionEntity | null>(cacheKey, options, async () => {
      this.logger.log(`Fetching session from database for ID: ${id}`);
      const session = await this.prismaService.session.findUnique({ where: { id } });

      if (!session) {
        this.logger.warn(`Session with ID: ${id} not found in database.`);
        return null;
      }

      return session;
    });
  }

  async findFirstByFingerPrintIdAndUserId(
    { fingerprintId, userId }: FindFirstByIdAndUserIdInput,
    options: CacheOperationsOptions = {},
  ): Promise<SessionEntity | null> {
    const cacheKey = this.sessionCacheHelperService.constructCacheKey(fingerprintId);

    this.logger.log(`Starting session lookup. ID: ${fingerprintId}, User ID: ${userId}, Cache Key: ${cacheKey}`);

    return await this.sessionCacheHelperService.fetchFromCacheOrDatabase<SessionEntity | null>(cacheKey, options, async () => {
      this.logger.log(`Session not found in cache. Fetching from database. ID: ${fingerprintId}, User ID: ${userId}`);
      const session = await this.prismaService.session.findFirst({ where: { fingerprintId, userId } });

      if (!session) {
        this.logger.log(`Session not found in cache. Fetching from database. ID: ${fingerprintId}, User ID: ${userId}`);
        return null;
      }

      return session;
    });
  }

  async deleteOneById(id: string): Promise<boolean> {
    try {
      // Deleting session from the database
      const session = await this.prismaService.session.delete({ where: { id } });

      const cacheKey = this.sessionCacheHelperService.constructCacheKey(session.fingerprintId);
      this.logger.log(`Attempting to delete session By ID: ${id}, Cache Key: ${cacheKey}`);

      if (session) {
        this.logger.log(`Session with ID: ${id} deleted from the database. Clearing cache for: ${cacheKey}`);
        // Deleting the session from cache
        await this.sessionCacheHelperService.clearCache(cacheKey);
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

  async createNewOrFindSession({ fingerprint, user, isInitialSession = false }: CreateSessionInput): Promise<SessionEntity> {
    if (isInitialSession) {
      return await this.create({ fingerprint, user });
    }

    let session = await this.findFirstByFingerPrintIdAndUserId({ fingerprintId: fingerprint.id, userId: user.id });

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
}
