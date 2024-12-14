import { UserEntity } from '@/common/types';
import type { Prisma } from '@prisma/client';

export interface CreateUserInput extends Pick<Prisma.UserCreateInput, 'email' | 'firstName' | 'lastName' | 'password'> {}

export type UserFindOneInput = {} & Prisma.UserWhereUniqueInput;

export interface UserOperationOptions {
  getInCache?: boolean; // Try to fetch the user from the cache if available
  saveToCache?: boolean; // Save the retrieved user to the cache
  clearCacheBefore?: boolean; // Clear the cache key before executing the query
  deleteFromCacheAfterRead?: boolean; // Delete the cache key after reading data from the cache
  cacheTTL?: number; // Time-to-live for cache entries, in seconds
}

export interface UserFindOneReturn extends UserEntity {}
