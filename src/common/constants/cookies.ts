import { toMs } from 'ms-typescript';

export enum COOKIES_NAME {
  FINGERPRINT_ID = '_fpid',
  SESSION_TOKEN = 'session_token',
  ACCESS_TOKEN = 'access_token',
  MFA_LOGIN_TOKEN = 'login-token',
}

export const COOKIES_DURATION = {
  SESSION_TOKEN_DURATION: toMs('7d'),
  ACCESS_TOKEN_DURATION: toMs('1h'),
  MFA_LOGIN_TOKEN_DURATION: toMs('5m'),
} as const;
