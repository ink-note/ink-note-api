import { toMs } from 'ms-typescript';
import * as dayjs from 'dayjs';

export const DURATIONS = {
  ACCESS_TOKEN_DURATION: toMs('1h'),
  SESSION_TOKEN_DURATION: toMs('7d'),
  RATE_LIMIT_DURATION: toMs('2m'),

  SESSION_ENTITY_DURATION: dayjs().add(7, 'days').toISOString(),
} as const;
