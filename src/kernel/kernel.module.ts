import { Module } from '@nestjs/common';
import { KernelService } from './kernel.service';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { MfaModule } from './mfa/mfa.module';
import { TotpModule } from './totp/totp.module';
import { CacheModule } from './cache/cache.module';
import { TokensModule } from './tokens/tokens.module';
import { AuthCoreModule } from './auth-core/auth-core.module';

@Module({
  providers: [KernelService],
  imports: [UserModule, SessionModule, MfaModule, TotpModule, CacheModule, TokensModule, AuthCoreModule],
})
export class KernelModule {}
