import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { CacheModule } from '@/common/services/cache';
import { TokensUtilModule } from '../tokens-util/tokens-util.module';

@Module({
  imports: [TokensUtilModule, CacheModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
