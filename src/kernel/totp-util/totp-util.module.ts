import { Module } from '@nestjs/common';
import { TotpUtilService } from './totp-util.service';

@Module({
  providers: [TotpUtilService],
  exports: [TotpUtilService],
})
export class TotpUtilModule {}
