import { Global, Module } from '@nestjs/common';

import { MailerCoreService } from './mailer-core.service';
import { MailerService } from './mailer.service';

@Global()
@Module({
  providers: [MailerCoreService, MailerService],
  exports: [MailerService],
})
export class MailerModule {}
