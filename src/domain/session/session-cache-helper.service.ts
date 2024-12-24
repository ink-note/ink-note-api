import { Injectable } from '@nestjs/common';
import { CacheHelperBaseService } from '../helpers/cache-helper-base.service';
import { CacheService } from '@/common/services/cache';
import { CacheOperationsOptions } from '../helpers/types';
import { SESSION_ENTITY_CACHE_TTL } from './constants';

@Injectable()
export class SessionCacheHelperService extends CacheHelperBaseService {
  constructor(protected readonly cacheService: CacheService) {
    super(cacheService);
  }
  getDefaultOptions(): CacheOperationsOptions {
    return {
      ...this.DEFAULT_OPTIONS,
      cacheTTL: SESSION_ENTITY_CACHE_TTL,
    };
  }

  constructCacheKey(id: string): string {
    return this.cacheService.generateKey('session', 'cache', id);
  }
}
