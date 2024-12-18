import { Prisma } from '@prisma/client';

export interface CreateTotpMfaInput {}

export interface FindOneTemporarySessionInput {}
export interface CreateTemporarySessionInput {}

export interface FindManyWithUserIdInput extends Pick<Prisma.MfaWhereInput, 'userId'> {}

export type GenerateCacheKeyContext = 'session' | 'temporary';
export interface GenerateCacheKeyInput {
  context?: GenerateCacheKeyContext;
}
