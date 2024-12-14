import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { toMs } from 'ms-typescript';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set<K = unknown>(key: string, value: K, ttl?: string | number): Promise<boolean> {
    try {
      await this.cacheManager.set(key, value, toMs(ttl));
      return true;
    } catch (error) {
      this.logger.error('Error setting value in cache:', error);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting value from cache for key "${key}":`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting value from cache for key "${key}":`, error);
    }
  }

  async getAfterDelete<T>(key: string): Promise<T | void> {
    try {
      const data = await this.cacheManager.get<T>(key);
      if (data) {
        await this.del(key); // Ensure data is deleted if found
      }
      return data; // Return data after deletion, or `undefined` if no data was found
    } catch (error) {
      this.logger.error(`Error getting and deleting value from cache for key "${key}":`, error);
    }
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset().catch(() => this.logger.warn('Reset is failed'));
  }
}
