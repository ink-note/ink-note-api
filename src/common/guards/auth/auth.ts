import { UseGuards, applyDecorators } from '@nestjs/common';

import { SessionTokenGuard } from './session-token';
import { AccessTokenGuard } from './access-token';

type AuthType = 'session' | 'access';

export function AuthGuard(authType: AuthType = 'access') {
  return applyDecorators(UseGuards(authType === 'access' ? AccessTokenGuard : SessionTokenGuard));
}
