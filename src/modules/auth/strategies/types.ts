import { SessionEntity, UserEntity } from '@/common/types';

export interface CurrentUserSession {
  user: UserEntity;
  session: SessionEntity;
}
