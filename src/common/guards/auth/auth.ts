import { UseGuards, applyDecorators } from '@nestjs/common';

import { SessionTokenGuard } from './session-token';
import { AccessTokenGuard } from './access-token';

type AuthType = 'session' | 'base';

export function AuthGuard(authType: AuthType = 'base') {
  return applyDecorators(
    UseGuards(authType === 'base' ? AccessTokenGuard : SessionTokenGuard),
  );
}
