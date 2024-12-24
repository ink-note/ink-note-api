import { Prisma } from '@prisma/client';

export interface CreateUserInput extends Prisma.UserCreateInput {}

export interface FindOneByIdInput extends Pick<Prisma.UserWhereUniqueInput, 'id'> {}
export interface FindOneByEmailInput extends Pick<Prisma.UserWhereUniqueInput, 'email'> {}
export interface DeleteOneByIdInput extends Pick<Prisma.UserWhereUniqueInput, 'id'> {}

export interface UpdateOneByIdInput extends Pick<Prisma.UserWhereUniqueInput, 'id'> {}
export interface UpdateOneByDataInput extends Prisma.UserUpdateInput {}

export interface ValidatingUserInput {
  email: string;
  password: string;
}
