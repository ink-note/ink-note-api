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
      const ttlMs = typeof ttl === 'string' ? toMs(ttl) : ttl;
      await this.cacheManager.set(key, value, ttlMs);
      return true;
    } catch (error) {
      this.logger.error('Error setting value in cache:', error);
      return false;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting value from cache for key "${key}":`, error);
      return undefined;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.cacheManager.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting value from cache for key "${key}":`, error);
      return false;
    }
  }

  async getAfterDelete<T>(key: string): Promise<T | undefined> {
    try {
      const data = await this.cacheManager.get<T>(key);
      if (data) {
        await this.del(key);
      }
      return data || undefined;
    } catch (error) {
      this.logger.error(`Error getting and deleting value from cache for key "${key}":`, error);
      return undefined;
    }
  }

  async reset(): Promise<boolean> {
    try {
      await this.cacheManager.reset();
      return true;
    } catch (error) {
      this.logger.warn('Reset failed:', error);
      return false;
    }
  }

  generateKey(entity: string, context: string, id: string): string {
    return `${entity}:${context}:${id}`;
  }
}
