import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { TotpUtilModule } from '../totp-util/totp-util.module';
import { TokensUtilModule } from '../tokens-util/tokens-util.module';
import { MfaSessionService } from './mfa-session.service';
import { MfaBackupCodeService } from './mfa-backup-code.service';
import { MfaCacheHelperService } from './mfa-cache-helper.service';

@Module({
  imports: [TotpUtilModule, TokensUtilModule],
  providers: [MfaService, MfaSessionService, MfaBackupCodeService, MfaCacheHelperService],
  exports: [MfaService],
})
export class MfaModule {}
