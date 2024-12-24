import { toMs } from 'ms-typescript';

export const SESSION_ENTITY_DURATION_ISO = new Date(new Date().getDay() + 7).toISOString();
export const SESSION_ENTITY_CACHE_TTL = toMs('1 hour');
