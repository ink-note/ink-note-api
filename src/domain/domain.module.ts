import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { MfaModule } from './mfa/mfa.module';
import { TotpUtilModule } from './totp-util/totp-util.module';
import { TokensUtilModule } from './tokens-util/tokens-util.module';

@Module({
  imports: [UserModule, SessionModule, MfaModule, TokensUtilModule, TotpUtilModule],
})
export class DomainModule {}
