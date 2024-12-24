import { Injectable } from '@nestjs/common';
import { CacheService } from '@/common/services/cache';
import { CacheHelperBaseService } from '../helpers/cache-helper-base.service';
import { CacheOperationsOptions } from '../helpers/types';
import { MFA_ENTITY_CACHE_TTL } from './constants';

@Injectable()
export class MfaCacheHelperService extends CacheHelperBaseService {
  constructor(protected readonly cacheService: CacheService) {
    super(cacheService);
  }

  getDefaultOptions(): CacheOperationsOptions {
    return {
      ...this.DEFAULT_OPTIONS,
      cacheTTL: MFA_ENTITY_CACHE_TTL,
    };
  }

  constructCacheKey(id: string): string {
    return this.cacheService.generateKey('mfa', 'cache', id);
  }

  constructTemporaryCacheKey(id: string): string {
    return this.cacheService.generateKey('mfa', 'temporary', id);
  }

  constructTemporaryLoginSessionCacheKey(id: string): string {
    return this.cacheService.generateKey('mfa', 'temporary-login-session', id);
  }

  constructSessionCacheKey(id: string): string {
    return this.cacheService.generateKey('mfa', 'session', id);
  }
}
