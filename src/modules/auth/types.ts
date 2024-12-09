import { UserProfile } from '@/common/types';
import { IssueTokens } from './session/types';

export interface ReturnSignUpData {
  tokens: IssueTokens;
  userProfile: UserProfile;
}
