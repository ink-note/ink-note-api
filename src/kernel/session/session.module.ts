import { Module } from '@nestjs/common';
import { SessionService } from './session.service';

import { TokensModule } from '../tokens/tokens.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [TokensModule, CacheModule],
  providers: [SessionService],
})
export class SessionModule {}
