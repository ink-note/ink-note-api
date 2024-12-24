import { CacheService } from '@/common/services/cache';
import { CacheOperationsOptions } from './types';

export abstract class CacheHelperBaseService {
  constructor(protected readonly cacheService: CacheService) {}

  public DEFAULT_OPTIONS: CacheOperationsOptions = {
    getInCache: true,
    saveToCache: true,
    clearCacheBeforeGet: false,
    deleteFromCacheAfterRead: false,
    cacheTTL: 0,
  };

  getDefaultOptions(): CacheOperationsOptions {
    return this.DEFAULT_OPTIONS;
  }

  processOptions(options: CacheOperationsOptions): CacheOperationsOptions {
    return {
      ...this.getDefaultOptions(),
      ...options,
    };
  }

  getCacheKey(entity: string, context: string, id: string): string {
    return `${entity}:${context}:${id}`;
  }

  async getFromCache<T>(cacheKey: string): Promise<T | null> {
    return await this.cacheService.get<T | null>(cacheKey);
  }

  async saveToCache<T>(cacheKey: string, data: T, ttl: number): Promise<void> {
    await this.cacheService.set(cacheKey, data, ttl);
  }

  async clearCache(cacheKey: string): Promise<void> {
    await this.cacheService.del(cacheKey);
  }

  async fetchFromCacheOrDatabase<T>(
    cacheKey: string,
    options: CacheOperationsOptions,
    fetchFromDatabase: () => Promise<T | null>,
  ): Promise<T | null> {
    const { getInCache, saveToCache, clearCacheBeforeGet, deleteFromCacheAfterRead, cacheTTL } = this.processOptions(options);

    if (clearCacheBeforeGet) {
      await this.clearCache(cacheKey);
    }

    if (getInCache) {
      const cachedData = await this.getFromCache<T>(cacheKey);
      if (cachedData) {
        if (deleteFromCacheAfterRead) {
          await this.clearCache(cacheKey);
        }
        return cachedData;
      }
    }

    const data = await fetchFromDatabase();
    if (data && saveToCache) {
      await this.saveToCache(cacheKey, data, cacheTTL);
    }

    return data;
  }
}
