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

export interface FindOneByIdInput extends Pick<Prisma.SessionWhereUniqueInput, 'id'> {}
export interface FindFirstByIdAndUserIdInput extends Pick<Prisma.SessionWhereUniqueInput, 'fingerprintId' | 'userId'> {
  fingerprintId: string;
}
