import { COOKIES_NAME } from '@/common/constants/cookies';
import { ModuleConfigs } from '@dilanjer/fingerprint';

export const getFingerprintConfig = (configs: ModuleConfigs = {}): ModuleConfigs => ({
  params: ['headers', 'userAgent', 'ipAddress', 'location'],
  cookieOptions: {
    name: COOKIES_NAME.FINGERPRINT_ID,
    httpOnly: true,
  },
  ...configs,
});
