import { Prisma } from '@prisma/client';

export interface CreateUserInput extends Prisma.UserCreateInput {}

export interface FindOneWithIdInput extends Pick<Prisma.UserWhereUniqueInput, 'id'> {}
export interface FindOneWithEmailInput extends Pick<Prisma.UserWhereUniqueInput, 'email'> {}
export interface DeleteOneWithIdInput extends Pick<Prisma.UserWhereUniqueInput, 'id'> {}

export interface UpdateOneWithIdInput extends Pick<Prisma.UserWhereUniqueInput, 'id'> {}
export interface UpdateOneWithDataInput extends Prisma.UserUpdateInput {}

export interface ValidatingUserInput {
  email: string;
  password: string;
}

export interface UserCacheOperationsOptions {
  getInCache?: boolean;
  saveToCache?: boolean;
  clearCacheBeforeGet?: boolean;
  deleteFromCacheAfterRead?: boolean;
  cacheTTL?: number;
}
