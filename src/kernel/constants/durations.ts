import { toMs } from 'ms-typescript';
import * as dayjs from 'dayjs';

export const DURATIONS = {
  TOKENS: {
    ACCESS_TOKEN_DURATION: toMs('1h'),
    SESSION_TOKEN_DURATION: toMs('7d'),
  },

  ENTITIES: {
    get SESSION_ENTITY_DURATION_ISO(): string {
      return dayjs().add(7, 'days').toISOString();
    },
    SESSION_ENTITY_CACHE_TTL: toMs('1 hour'),
    USER_ENTITY_CACHE_TTL: toMs('1 hour'),

    MFA_ENTITY_CACHE_TTL: toMs('1 hour'),
    MFA_ENTITIES_CACHE_TTL: toMs('1 hour'),
    MFA_ENTITY_TEMPORARY_CACHE_TTL: toMs('5 min'),
    MFA_ENTITY_SESSION_CACHE_TTL: toMs('5 min'),
  },
} as const;

export type DurationKey = keyof typeof DURATIONS;

export type DurationValue = (typeof DURATIONS)[DurationKey];
