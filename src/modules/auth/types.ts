import { SessionEntity, UserEntity, UserProfile } from '@/common/types';
import { AccessTokenPayload, IssueTokens } from './session/types';

export interface ReturnSignUpData {
  tokens: IssueTokens;
  userProfile: UserProfile;
}

export interface UserSessionType {
  user: UserEntity;
  session: SessionEntity;
}
export interface UserType extends AccessTokenPayload {}
