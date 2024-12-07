import { UserProfile } from '@/common/types';

export interface IssueTokens {
  access_token: string;
  refresh_token: string;
}

export interface ReturnSignUpData {
  tokens: IssueTokens;
  userProfile: UserProfile;
}
