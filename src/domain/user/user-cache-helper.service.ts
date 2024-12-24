import { CacheService } from '@/common/services/cache';
import { Injectable } from '@nestjs/common';
import { CacheHelperBaseService } from '../helpers/cache-helper-base.service';
import { CacheOperationsOptions } from '../helpers/types';
import { USER_ENTITY_CACHE_TTL } from './constants';

@Injectable()
export class UserCacheHelperService extends CacheHelperBaseService {
  constructor(protected readonly cacheService: CacheService) {
    super(cacheService);
  }

  getDefaultOptions(): CacheOperationsOptions {
    return {
      ...this.DEFAULT_OPTIONS,
      cacheTTL: USER_ENTITY_CACHE_TTL,
    };
  }

  constructCacheKey(id: string): string {
    return this.cacheService.generateKey('user', 'cache', id);
  }
}
