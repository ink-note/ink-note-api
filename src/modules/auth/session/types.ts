import type { UserEntity } from '@/common/types';
import { FingerPrint } from '@dilanjer/fingerprint';

export interface CreateSessionInput {
  fingerprint: FingerPrint;
  user: UserEntity;
  isFirstSession?: boolean;
}

export interface IssueTokens {
  access_token: string;
  session_token: string;
}

export interface AccessTokenPayload {
  id: string;
  email: string;
}
export interface SessionTokenPayload {
  fpId: string;
  usId: string;
  seId: string;
}
