import { DURATIONS } from '@/common/constants/durations';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
export const getThrottlerConfig = (config: ThrottlerModuleOptions = []): ThrottlerModuleOptions => {
  if (config) {
    return config;
  }
  return [
    {
      ttl: DURATIONS.RATE_LIMIT_DURATION,
      limit: 60,
    },
  ];
};
