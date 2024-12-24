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
  ValidatingUserInput,
} from './types';
import { UserEntity, UserProfile } from '../types';
import { Pick } from '@/shared/utils/object';
import { USER_ENTITY_CACHE_TTL } from './constants';
import { UserCacheHelperService } from './user-cache-helper.service';
import { CacheOperationsOptions } from '../helpers/types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userCacheHelperService: UserCacheHelperService,
  ) {}

  async create(input: CreateUserInput): Promise<UserEntity> {
    const { firstName, lastName, password, email, ...rest } = input;
    const fullName = `${firstName} ${lastName}`;

    this.logger.log(`Starting user creation process for email: ${email}`);
    try {
      const encryptedPassword = await this.encryptPassword(password);
      const lastSignInAt = dayjs().toISOString();

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

      const cacheKey = this.userCacheHelperService.constructCacheKey(user.id);
      await this.userCacheHelperService.saveToCache(cacheKey, user, USER_ENTITY_CACHE_TTL);

      this.logger.log(`User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error during user creation for email: ${email}`, error.stack);
      throw error;
    }
  }

  async updateOneById(input: UpdateOneByIdInput, data: UpdateOneByDataInput): Promise<boolean> {
    const { id } = input;
    const cacheKey = this.userCacheHelperService.constructCacheKey(id);

    this.logger.log(`Updating user with ID: ${id}`);
    try {
      const updatedUser = await this.prismaService.user.update({ where: { id }, data });

      if (updatedUser) {
        await this.userCacheHelperService.saveToCache<UserEntity>(cacheKey, updatedUser, USER_ENTITY_CACHE_TTL);
        return true;
      }

      this.logger.warn(`Update returned null for user ID: ${id}`);
      return false;
    } catch (error) {
      this.logger.error(`Error updating user with ID: ${id}`, error.stack);
      throw error;
    }
  }

  async deleteOneById(input: DeleteOneByIdInput): Promise<boolean> {
    const { id } = input;
    const cacheKey = this.userCacheHelperService.constructCacheKey(id);

    this.logger.log(`Deleting user with ID: ${id}`);
    try {
      const deletedUser = await this.prismaService.user.delete({ where: { id } });

      if (deletedUser) {
        await this.userCacheHelperService.clearCache(cacheKey);
        return true;
      }

      this.logger.warn(`Delete returned null for user ID: ${id}`);
      return false;
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`User with ID: ${id} does not exist.`);
        return false;
      }
      this.logger.error(`Error deleting user with ID: ${id}`, error.stack);
      throw error;
    }
  }

  async findOneById(input: FindOneByIdInput, options: CacheOperationsOptions = {}): Promise<UserEntity | null> {
    const { id } = input;
    const cacheKey = this.userCacheHelperService.constructCacheKey(id);

    this.logger.log(`Finding user by ID: ${id}`);
    return this.userCacheHelperService.fetchFromCacheOrDatabase<UserEntity | null>(cacheKey, options, () =>
      this.prismaService.user.findUnique({ where: { id } }),
    );
  }

  async findOneByEmail(input: FindOneByEmailInput, options: CacheOperationsOptions = {}): Promise<UserEntity | null> {
    const { email } = input;
    const cacheKey = this.userCacheHelperService.constructCacheKey(email);

    this.logger.log(`Finding user by email: ${email}`);
    return this.userCacheHelperService.fetchFromCacheOrDatabase<UserEntity | null>(cacheKey, options, () =>
      this.prismaService.user.findUnique({ where: { email } }),
    );
  }

  async validate(input: ValidatingUserInput): Promise<UserEntity | null> {
    const { email, password } = input;
    this.logger.log(`Validating user with email: ${email}`);

    try {
      const user = await this.findOneByEmail({ email });
      if (!user) {
        return null;
      }

      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Error validating user with email: ${email}`, error.stack);
      throw error;
    }
  }

  prepareUserProfileData(user: UserEntity): UserProfile {
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

  private async encryptPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
