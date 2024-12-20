import { Prisma, MfaType } from '@prisma/client';
import { CacheOperationsOptions, UserEntity } from '../types';

export interface CreateMfaInput {
  user: UserEntity;
  type: MfaType;
}

export interface MfaCacheOperationsOptions extends CacheOperationsOptions {}

export interface FindManyByUserId extends Pick<Prisma.MfaWhereUniqueInput, 'userId'> {}
