import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { SessionModule } from '../session';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [SessionModule, UserModule],
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}
