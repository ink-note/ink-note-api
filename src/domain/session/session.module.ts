import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { TokensUtilModule } from '../tokens-util/tokens-util.module';
import { SessionCacheHelperService } from './session-cache-helper.service';

@Module({
  imports: [TokensUtilModule],
  providers: [SessionService, SessionCacheHelperService],
  exports: [SessionService],
})
export class SessionModule {}
