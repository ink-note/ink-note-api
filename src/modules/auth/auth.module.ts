import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { TokensUtilModule } from '@/domain/tokens-util/tokens-util.module';
import { UserModule } from '@/domain/user/user.module';
import { SessionModule } from '@/domain/session/session.module';
import { MfaModule } from '@/domain/mfa/mfa.module';
import { AccessTokenStrategy } from './strategies/access-token';

@Module({
  imports: [TokensUtilModule, UserModule, SessionModule, MfaModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy],
})
export class AuthModule {}
