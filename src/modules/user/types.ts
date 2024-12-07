import type { Prisma } from '@prisma/client';

export interface CreateUserInput
  extends Pick<
    Prisma.UserCreateInput,
    'email' | 'firstName' | 'lastName' | 'password'
  > {}
