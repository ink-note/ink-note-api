import { FingerPrint } from '@dilanjer/fingerprint';
import { UserEntity } from '../types';
import { Prisma } from '@prisma/client';

export interface CreateSessionInput {
  fingerprint: FingerPrint;
  user: UserEntity;
  isInitialSession?: boolean;
}

export interface FingerprintData {
  fingerprintId: string;
  fingerprintData: string;
}

export interface FindOneWithIdInput extends Pick<Prisma.SessionWhereUniqueInput, 'id'> {}
export interface FindFirstWithIdAndUserIdInput extends Pick<Prisma.SessionWhereUniqueInput, 'id' | 'userId'> {}

export interface SessionCacheOperationsOptions {
  getInCache?: boolean;
  saveToCache?: boolean;
  clearCacheBeforeGet?: boolean;
  deleteFromCacheAfterRead?: boolean;
  cacheTTL?: number;
}
