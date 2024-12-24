import { Prisma, MfaType, Mfa } from '@prisma/client';

export interface FindManyByUserId extends Pick<Prisma.MfaWhereUniqueInput, 'userId'> {
  userId: string;
}

export interface CreateMfaTemporaryInput {
  userId: string;
  type: MfaType;
}

export interface CreateMfaTemporaryTOTPInput {
  userId: string;
}

export interface CreateMfaTemporaryTOTPOutput extends Pick<Mfa, 'id' | 'secret'> {
  qrCodeUrl: string;
}

export interface VerifyEnrollTOTPInput {
  code: string;
  userId: string;
  mfaSettingsId: string;
  friendlyName: string;
}

export interface CreateMfaSuccessSession {}

export interface VerifyTOTPInput {
  mfaSettingsId: string;
  code: string;
}
