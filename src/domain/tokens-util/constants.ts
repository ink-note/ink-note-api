import { toMs } from 'ms-typescript';

export const ACCESS_TOKEN_DURATION = toMs('1h'); // ttl token 1 hour
export const SESSION_TOKEN_DURATION = toMs('7d'); // ttl token 7 days
export const MFA_TEMPORARY_LOGIN_TOKEN_DURATION = toMs('5m'); // ttl token 5 minutes
