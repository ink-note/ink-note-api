import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { UserModule } from '../user/user.module';
import { TotpMfaService } from './totp-mfa/totp-mfa.service';
import { TotpModule } from '../totp/totp.module';

@Module({
  imports: [UserModule, TotpModule],
  providers: [MfaService, TotpMfaService],
})
export class MfaModule {}
