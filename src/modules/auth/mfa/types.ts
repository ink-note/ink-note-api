import { UserEntity } from '@/common/types';
import { MfaKeyGenerationResponse } from '@/shared/utils/totp';
import { Prisma, MfaType } from '@prisma/client';

export interface MfaFindManyInput extends Prisma.MfaFindManyArgs {}
export interface MfaFindUniqueInput extends Prisma.MfaFindUniqueArgs {}

export interface CreateMfaInput {
  user: UserEntity;
}

export interface CreateTemporaryMfaInput extends Partial<Prisma.MfaCreateInput> {}

export interface MfaCreateInput {}

export interface CreateTemporaryTokenInput {
  email?: string;
  userId?: string;
}

export interface GenerateMfaCacheKey {
  email?: string;
  userId?: string;
  tempMfaId?: string;
}

export interface TemporaryMfaInCache {
  id: string;
  totp: MfaKeyGenerationResponse;
}
