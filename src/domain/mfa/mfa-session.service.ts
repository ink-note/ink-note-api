import { Injectable } from '@nestjs/common';
import { MFA_SESSION_CACHE_TTL } from './constants';
import { MfaCacheHelperService } from './mfa-cache-helper.service';

@Injectable()
export class MfaSessionService {
  constructor(private readonly mfaCacheHelperService: MfaCacheHelperService) {}

  async createSession(userId: string): Promise<void> {
    const cacheKey = this.mfaCacheHelperService.constructSessionCacheKey(userId);
    return await this.mfaCacheHelperService.saveToCache(cacheKey, userId, MFA_SESSION_CACHE_TTL);
  }

  async retrieveSession(userId: string): Promise<string | null> {
    const cacheKey = this.mfaCacheHelperService.constructSessionCacheKey(userId);
    return await this.mfaCacheHelperService.getFromCache<string | null>(cacheKey);
  }
}
