import { toMs } from 'ms-typescript';
import * as dayjs from 'dayjs';

/**
 * Duration constants used throughout the application
 * All durations are in milliseconds unless specified otherwise
 */
export const DURATIONS = {
  /**
   * Access token expiration duration (1 hour)
   */
  ACCESS_TOKEN_DURATION: toMs('1h'),

  /**
   * Session token expiration duration (7 days)
   */
  SESSION_TOKEN_DURATION: toMs('7d'),

  /**
   * Rate limit window duration (2 minutes)
   */
  RATE_LIMIT_DURATION: toMs('2m'),

  /**
   * Session entity expiration date in ISO format (7 days from now)
   * @returns ISO string representing the expiration date
   */
  get SESSION_ENTITY_DURATION_ISO(): string {
    return dayjs().add(7, 'days').toISOString();
  },
} as const;

/**
 * Type representing all available duration keys
 */
export type DurationKey = keyof typeof DURATIONS;

/**
 * Type representing duration values (either number for ms or string for ISO)
 */
export type DurationValue = (typeof DURATIONS)[DurationKey];
