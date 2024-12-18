import type { Mfa, Session, User } from '@prisma/client';

export interface UserEntity extends User {}
export interface SessionEntity extends Session {}
export interface MfaEntity extends Mfa {}

export interface UserProfile
  extends Pick<User, 'firstName' | 'fullName' | 'imageUrl' | 'lastName' | 'id' | 'hasVerifiedEmailAddress' | 'email'> {}

export interface MfaData extends Pick<Mfa, 'enabled' | 'friendlyName' | 'type' | 'id' | 'createdAt'> {}
export interface MfaTemporary extends Pick<Mfa, 'id' | 'secret' | 'qrCodeUrl'> {}
