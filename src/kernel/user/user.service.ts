import { Injectable, Logger } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import * as dayjs from 'dayjs';

import { PrismaService } from '@/common/services/prisma';
import { CacheService } from '../cache/cache.service';
import {
  CreateUserInput,
  DeleteOneWithIdInput,
  FindOneWithEmailInput,
  FindOneWithIdInput,
  UpdateOneWithDataInput,
  UpdateOneWithIdInput,
  UserCacheOperationsOptions,
  ValidatingUserInput,
} from './types';
import { UserEntity } from '../types';
import { DURATIONS } from '../constants/durations';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async create({ firstName, lastName, password, email, ...rest }: CreateUserInput): Promise<UserEntity> {
    const fullName = `${firstName} ${lastName}`;

    this.logger.log(`Starting user creation process for email: ${email}`);

    try {
      // Encrypt password
      this.logger.log(`Encrypting password for email: ${email}`);
      const encryptedPassword = await this.encryptingPassword(password);

      // Set last sign-in time
      const lastSignInAt = dayjs().toISOString();
      this.logger.log(`Last sign-in time set for email: ${email}`);

      // Create user in the database
      this.logger.log(`Inserting user into the database with email: ${email}`);
      const user = await this.prismaService.user.create({
        data: {
          email,
          fullName,
          firstName,
          lastName,
          lastSignInAt,
          password: encryptedPassword,
          ...rest,
        },
      });

      // Cache the created user
      const cacheKey = this.generateCacheKey(user.id);
      this.logger.log(`Saving user to cache with key: ${cacheKey}`);
      await this.cacheService.set(cacheKey, user);

      this.logger.log(`User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error occurred during user creation for email: ${email}`, error.stack);
      throw error; // Propagate error for further handling
    }
  }

  public async update({ id }: UpdateOneWithIdInput, data: UpdateOneWithDataInput): Promise<boolean> {
    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Starting update process for user with ID: ${id}`);
    try {
      // Perform the update operation
      const updatedUser = await this.prismaService.user.update({ where: { id }, data });

      if (updatedUser) {
        this.logger.log(`User with ID: ${id} updated successfully. Saving updated user to cache with key: ${cacheKey}`);
        await this.cacheService.set<UserEntity>(cacheKey, updatedUser, DURATIONS.ENTITIES.USER_ENTITY_CACHE_TTL);
        return true; // Indicate success
      }

      // Log if the update did not return an object
      this.logger.warn(`Update for user with ID: ${id} returned null. No changes made.`);
      return false; // Indicate failure
    } catch (error) {
      // Log the error and re-throw it
      this.logger.error(`Error occurred while updating user with ID: ${id}`, error.stack);
      throw error;
    }
  }

  public async delete({ id }: DeleteOneWithIdInput): Promise<boolean> {
    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Starting delete process for user with ID: ${id}`);
    try {
      // Perform the delete operation
      const deletedUser = await this.prismaService.user.delete({ where: { id } });

      if (deletedUser) {
        this.logger.log(`User with ID: ${id} deleted successfully. Removing from cache with key: ${cacheKey}`);
        await this.cacheService.del(cacheKey);
        return true; // Indicate successful deletion
      }

      // Log if deletion was unsuccessful
      this.logger.warn(`Deletion for user with ID: ${id} returned null. No user deleted.`);
      return false; // Indicate failure
    } catch (error) {
      // Handle and log errors
      if (error.code === 'P2025') {
        // Example: Prisma "Record not found" error
        this.logger.warn(`User with ID: ${id} does not exist. Cannot delete.`);
        return false; // Return false if user does not exist
      }

      this.logger.error(`Error occurred while deleting user with ID: ${id}`, error.stack);
      throw error; // Re-throw for higher-level handling
    }
  }

  public async findOneWithId({ id }: FindOneWithIdInput, options: UserCacheOperationsOptions = {}) {
    const {
      getInCache = true,
      saveToCache = true,
      clearCacheBeforeGet,
      deleteFromCacheAfterRead,
      cacheTTL = DURATIONS.ENTITIES.USER_ENTITY_CACHE_TTL,
    } = options;

    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Finding user with ID: ${id}, Cache Key: ${cacheKey}`);

    if (clearCacheBeforeGet) {
      this.logger.log(`Clearing cache before fetching user: ${cacheKey}`);
      await this.cacheService.del(cacheKey);
    }

    if (getInCache) {
      this.logger.log(`Checking cache for user: ${cacheKey}`);
      const cachedUser = await this.cacheService.get<UserEntity | null>(cacheKey);

      if (cachedUser) {
        this.logger.log(`Found user in cache: ${cacheKey}`);

        if (deleteFromCacheAfterRead) {
          this.logger.log(`Deleting user from cache after reading: ${cacheKey}`);
          await this.cacheService.del(cacheKey);
        }

        return cachedUser;
      } else {
        this.logger.log(`No user found in cache for: ${cacheKey}`);
      }
    }

    this.logger.log(`Fetching user from database for ID: ${id}`);
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (user) {
      this.logger.log(`User found in database. ${saveToCache ? 'Saving to cache' : 'Not saving to cache'}`);

      if (saveToCache) {
        this.logger.log(`Saving user to cache: ${cacheKey}`);
        await this.cacheService.set(cacheKey, user, cacheTTL);
      }
    } else {
      this.logger.warn(`User with ID: ${id} not found in database.`);
    }

    return user;
  }

  public async findOneWithEmail({ email }: FindOneWithEmailInput, options: UserCacheOperationsOptions = {}) {
    const {
      getInCache = true,
      saveToCache = true,
      clearCacheBeforeGet,
      deleteFromCacheAfterRead,
      cacheTTL = DURATIONS.ENTITIES.USER_ENTITY_CACHE_TTL,
    } = options;

    const cacheKey = this.generateCacheKey(email);

    this.logger.log(`Finding user with Email: ${email}, Cache Key: ${cacheKey}`);

    if (clearCacheBeforeGet) {
      this.logger.log(`Clearing cache before fetching user: ${cacheKey}`);
      await this.cacheService.del(cacheKey);
    }

    if (getInCache) {
      this.logger.log(`Checking cache for user: ${cacheKey}`);
      const cachedUser = await this.cacheService.get<UserEntity | null>(cacheKey);

      if (cachedUser) {
        this.logger.log(`Found user in cache: ${cacheKey}`);

        if (deleteFromCacheAfterRead) {
          this.logger.log(`Deleting user from cache after reading: ${cacheKey}`);
          await this.cacheService.del(cacheKey);
        }

        return cachedUser;
      } else {
        this.logger.log(`No user found in cache for: ${cacheKey}`);
      }
    }

    this.logger.log(`Fetching user from database for Email: ${email}`);
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (user) {
      this.logger.log(`User found in database. ${saveToCache ? 'Saving to cache' : 'Not saving to cache'}`);

      if (saveToCache) {
        this.logger.log(`Saving user to cache: ${cacheKey}`);
        await this.cacheService.set(cacheKey, user, cacheTTL);
      }
    } else {
      this.logger.warn(`User with Email: ${email} not found in database.`);
    }

    return user;
  }

  public async validateUser({ email, password }: ValidatingUserInput): Promise<boolean> {
    const cacheKey = this.generateCacheKey(email);

    this.logger.log(`Validating user with email: ${email}`);

    try {
      const user = await this.findOneWithEmail({ email });

      if (!user) {
        this.logger.warn(`User with email: ${email} not found.`);
        return false;
      }

      this.logger.log(`User with email: ${email} found. Validating password.`);

      const passwordMatches = await this.decryptingPassword(user.password, password);

      if (passwordMatches) {
        this.logger.log(`Password matches for user with email: ${email}`);
        return true;
      }

      this.logger.warn(`Password does not match for user with email: ${email}. Clearing cache.`);
      await this.cacheService.del(cacheKey);
      return false;
    } catch (error) {
      this.logger.error(`Error validating user with email: ${email}`, error.stack);
      throw error; // Propagate the error for handling elsewhere
    }
  }

  private async encryptingPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  private async decryptingPassword(password: string, encryptedPassword: string): Promise<boolean> {
    return await compare(password, encryptedPassword);
  }

  private generateCacheKey(id: string): string {
    return this.cacheService.generateKey('user', 'cache', id);
  }
}
