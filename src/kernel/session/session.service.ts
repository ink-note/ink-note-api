import { Injectable, Logger } from '@nestjs/common';
import { FingerPrint } from '@dilanjer/fingerprint';

import { PrismaService } from '@/common/services/prisma';
import {
  CreateSessionInput,
  FindFirstWithIdAndUserIdInput,
  FindOneWithIdInput,
  FingerprintData,
  SessionCacheOperationsOptions,
} from './types';
import { DURATIONS } from '../constants/durations';
import { CacheService } from '../cache/cache.service';
import { SessionEntity } from '../types';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  public async findOneWithId(
    { id }: FindOneWithIdInput,
    options: SessionCacheOperationsOptions = {},
  ): Promise<SessionEntity | null> {
    const {
      getInCache = true,
      saveToCache = true,
      clearCacheBeforeGet,
      deleteFromCacheAfterRead,
      cacheTTL = DURATIONS.ENTITIES.SESSION_ENTITY_CACHE_TTL,
    } = options;

    const cacheKey = this.generateCacheKey(id);

    // Log the start of the process
    this.logger.log(`Finding session with ID: ${id}, Cache Key: ${cacheKey}`);

    if (clearCacheBeforeGet) {
      this.logger.log(`Clearing cache before fetching session: ${cacheKey}`);
      await this.cacheService.del(cacheKey);
    }

    if (getInCache) {
      this.logger.log(`Checking cache for session: ${cacheKey}`);
      const cachedSession = await this.cacheService.get<SessionEntity | null>(cacheKey);

      if (cachedSession) {
        this.logger.log(`Found session in cache: ${cacheKey}`);

        if (deleteFromCacheAfterRead) {
          this.logger.log(`Deleting session from cache after reading: ${cacheKey}`);
          await this.cacheService.del(cacheKey);
        }

        return cachedSession;
      } else {
        this.logger.log(`No session found in cache for: ${cacheKey}`);
      }
    }

    // Log when fetching from the database
    this.logger.log(`Fetching session from database for ID: ${id}`);
    const session = await this.prismaService.session.findUnique({ where: { id } });

    if (session) {
      this.logger.log(`Session found in database. ${saveToCache ? 'Saving to cache' : 'Not saving to cache'}`);

      if (saveToCache) {
        this.logger.log(`Saving session to cache: ${cacheKey}`);
        await this.cacheService.set(cacheKey, session, cacheTTL);
      }
    } else {
      this.logger.warn(`Session with ID: ${id} not found in database.`);
    }

    return session;
  }

  public async findFirstWithIdAndUserId(
    { id, userId }: FindFirstWithIdAndUserIdInput,
    options: SessionCacheOperationsOptions = {},
  ): Promise<SessionEntity | null> {
    const {
      getInCache = true,
      saveToCache = true,
      clearCacheBeforeGet,
      deleteFromCacheAfterRead,
      cacheTTL = DURATIONS.ENTITIES.SESSION_ENTITY_CACHE_TTL,
    } = options;

    const cacheKey = this.generateCacheKey(id);

    // Start of the process
    this.logger.log(`Starting session lookup. ID: ${id}, User ID: ${userId}, Cache Key: ${cacheKey}`);

    // Clearing cache if requested
    if (clearCacheBeforeGet) {
      this.logger.log(`Clearing cache before fetching session. Cache Key: ${cacheKey}`);
      await this.cacheService.del(cacheKey);
    }

    let session = null;

    // Attempt to get session from cache
    if (getInCache) {
      this.logger.log(`Checking cache for session. Cache Key: ${cacheKey}`);
      session = await this.cacheService.get<SessionEntity | null>(cacheKey);

      if (session) {
        this.logger.log(`Session found in cache. Cache Key: ${cacheKey}`);

        // Deleting from cache after read if requested
        if (deleteFromCacheAfterRead) {
          this.logger.log(`Deleting session from cache after reading. Cache Key: ${cacheKey}`);
          await this.cacheService.del(cacheKey);
        }

        return session;
      } else {
        this.logger.log(`No session found in cache. Cache Key: ${cacheKey}`);
      }
    }

    // If session not found in cache, fetch from database
    this.logger.log(`Session not found in cache. Fetching from database. ID: ${id}, User ID: ${userId}`);
    session = await this.prismaService.session.findFirst({ where: { id, userId } });

    if (session) {
      this.logger.log(`Session found in database. ${saveToCache ? 'Saving to cache.' : 'Not saving to cache.'}`);

      if (saveToCache) {
        this.logger.log(`Saving session to cache. Cache Key: ${cacheKey}`);
        await this.cacheService.set(cacheKey, session, cacheTTL);
      }
    } else {
      this.logger.warn(`No session found in database. ID: ${id}, User ID: ${userId}`);
    }

    return session;
  }

  public async deleteOneWithId(id: string): Promise<boolean> {
    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Attempting to delete session with ID: ${id}, Cache Key: ${cacheKey}`);

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

    let session = await this.findFirstWithIdAndUserId({ id: fingerprint.id, userId: user.id });

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
          expiresAt: DURATIONS.ENTITIES.SESSION_ENTITY_DURATION_ISO,
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
    return this.cacheService.generateKey('session', 'cache', id);
  }
}
