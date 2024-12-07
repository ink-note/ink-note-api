import type { UserEntity } from '@/common/types';
import { FingerPrint } from '@dilanjer/fingerprint';

export interface CreateSessionInput {
  fingerprint: FingerPrint;
  user: UserEntity;
}
