export interface CacheOperationsOptions {
  getInCache?: boolean;
  saveToCache?: boolean;
  clearCacheBeforeGet?: boolean;
  deleteFromCacheAfterRead?: boolean;
  cacheTTL?: number;
}
