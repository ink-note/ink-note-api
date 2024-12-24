import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { toMs } from 'ms-typescript';

export const RATE_LIMIT_DURATION = toMs('2m');

export const getThrottlerConfig = (config?: ThrottlerModuleOptions): ThrottlerModuleOptions => {
  if (config) {
    return config;
  }
  return [
    {
      ttl: RATE_LIMIT_DURATION,
      limit: 60,
    },
  ];
};
