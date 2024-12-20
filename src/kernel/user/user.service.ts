import { Injectable, Logger } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import * as dayjs from 'dayjs';

import { PrismaService } from '@/common/services/prisma';
import {
  CreateUserInput,
  DeleteOneByIdInput,
  FindOneByEmailInput,
  FindOneByIdInput,
  UpdateOneByDataInput,
  UpdateOneByIdInput,
  UserCacheOperationsOptions,
  ValidatingUserInput,
} from './types';
import { UserEntity, UserProfile } from '../types';
import { Pick } from '@/shared/utils/object';
import { CacheService } from '@/common/services/cache';
import { USER_ENTITY_CACHE_TTL } from './constants';
import { EntityBase } from '../entity-base.service';

@Injectable()
export class UserService extends EntityBase {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prismaService: PrismaService,
    readonly cacheService: CacheService,
  ) {
    super(cacheService);
  }

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

  public async updateOne({ id }: UpdateOneByIdInput, data: UpdateOneByDataInput): Promise<boolean> {
    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Starting update process for user with ID: ${id}`);
    try {
      // Perform the update operation
      const updatedUser = await this.prismaService.user.update({ where: { id }, data });

      if (updatedUser) {
        this.logger.log(`User with ID: ${id} updated successfully. Saving updated user to cache with key: ${cacheKey}`);
        await this.cacheService.set<UserEntity>(cacheKey, updatedUser, USER_ENTITY_CACHE_TTL);
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

  public async deleteOne({ id }: DeleteOneByIdInput): Promise<boolean> {
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

  public async findOneById({ id }: FindOneByIdInput, options: UserCacheOperationsOptions = {}): Promise<UserEntity | null> {
    const currentOptions = this.processOptions({ ...options, cacheTTL: USER_ENTITY_CACHE_TTL });

    const cacheKey = this.generateCacheKey(id);

    this.logger.log(`Finding user with ID: ${id}, Cache Key: ${cacheKey}`);

    return this.handleCache<UserEntity | null>(cacheKey, currentOptions, async () => {
      this.logger.log(`Fetching user from database for ID: ${id}`);
      const user = await this.prismaService.user.findUnique({ where: { id } });

      if (!user) {
        this.logger.warn(`User with ID: ${id} not found in database.`);
        return null;
      }

      return user;
    });
  }

  public async findOneByEmail({ email }: FindOneByEmailInput, options: UserCacheOperationsOptions = {}) {
    const currentOptions = this.processOptions({ ...options, cacheTTL: USER_ENTITY_CACHE_TTL });

    const cacheKey = this.generateCacheKey(email);

    this.logger.log(`Finding user with email: ${email}, Cache Key: ${cacheKey}`);

    return this.handleCache<UserEntity | null>(cacheKey, currentOptions, async () => {
      this.logger.log(`Fetching user from database for email: ${email}`);
      const user = await this.prismaService.user.findUnique({ where: { email } });

      if (!user) {
        this.logger.warn(`User with email: ${email} not found in database.`);
        return null;
      }

      return user;
    });
  }

  public async validate({ email, password }: ValidatingUserInput): Promise<boolean> {
    const cacheKey = this.generateCacheKey(email);

    this.logger.log(`Validating user with email: ${email}`);

    try {
      const user = await this.findOneByEmail({ email });

      if (!user) {
        this.logger.warn(`User with email: ${email} not found.`);
        return false;
      }

      this.logger.log(`User with email: ${email} found. Validating password.`);

      const passwordMatches = await this.decryptingPassword(user.password, password);

      if (!passwordMatches) {
        this.logger.warn(`Password does not match for user with email: ${email}. `);
        //TODO: await this.cacheService.del(cacheKey);
        return false;
      }

      this.logger.log(`Password matches for user with email: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Error validating user with email: ${email}`, error.stack);
      throw error; // Propagate the error for handling elsewhere
    }
  }

  public prepareUserProfileData(user: UserEntity): UserProfile {
    return Pick(user, [
      'id',
      'email',
      'fullName',
      'firstName',
      'lastName',
      'lastSignInAt',
      'hasVerifiedEmailAddress',
      'imageUrl',
    ]);
  }

  private async encryptingPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  private async decryptingPassword(password: string, encryptedPassword: string): Promise<boolean> {
    return await compare(password, encryptedPassword);
  }

  private generateCacheKey(id: string): string {
    return this.getCacheKey('user', 'cache', id);
  }
}
