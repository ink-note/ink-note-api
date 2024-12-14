import { PrismaService } from '@/common/services/prisma';
import { Pick } from '@/shared/utils/object';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { CreateUserInput, UserFindOneInput, UserOperationOptions } from './types';
import { UserEntity, UserProfile } from '@/common/types';
import { CacheService } from '@/common/services/cache';
import { toMs } from 'ms-typescript';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheServicer: CacheService,
  ) {}

  async create({ firstName, lastName, ...rest }: CreateUserInput): Promise<User> {
    const fullName = `${firstName} ${lastName}`;
    return await this.prisma.user.create({
      data: {
        fullName,
        firstName,
        lastName,
        ...rest,
        lastSignInAt: new Date(),
      },
    });
  }

  async update(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    return await this.prisma.user.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async findOne(findOneInput: UserFindOneInput, options: UserOperationOptions = {}): Promise<UserEntity> {
    const {
      getInCache,
      saveToCache,
      clearCacheBefore,
      deleteFromCacheAfterRead,
      cacheTTL = toMs('1 hour'), // Default TTL is 1 hour
    } = options;

    const cacheKey = this.generateCacheKey(findOneInput);

    // If `clearCacheBefore` is true, delete the cache key before proceeding
    if (clearCacheBefore) {
      await this.cacheServicer.del(cacheKey);
    }

    // If `getInCache` is true, try to retrieve the data from the cache
    if (getInCache) {
      const cachedUser = await this.cacheServicer.get<UserEntity>(cacheKey);
      if (cachedUser) {
        // If `deleteFromCacheAfterRead` is true, remove the cache key after reading
        if (deleteFromCacheAfterRead) {
          await this.cacheServicer.del(cacheKey);
        }
        return cachedUser;
      }
    }

    // Fetch the user data from the database if not found in the cache
    const user = await this.prisma.user.findUnique({
      where: findOneInput,
    });

    // If the user exists and `saveToCache` is true, store the data in the cache
    if (user && saveToCache) {
      await this.cacheServicer.set(cacheKey, user, cacheTTL);
    }

    return user;
  }

  getUserPublicData(user: User): UserProfile {
    return Pick(user, ['firstName', 'fullName', 'imageUrl', 'lastName', 'id', 'hasVerifiedEmailAddress', 'email']);
  }

  private generateCacheKey(userWhereUniqueInput: Prisma.UserWhereUniqueInput): string {
    // Use unique identifiers (e.g., ID or email) to create a unique cache key
    if (userWhereUniqueInput.id) {
      return `user:id:${userWhereUniqueInput.id}`;
    }
    if (userWhereUniqueInput.email) {
      return `user:email:${userWhereUniqueInput.email}`;
    }
    throw new Error('Invalid userWhereUniqueInput: no unique identifier provided.');
  }
}
