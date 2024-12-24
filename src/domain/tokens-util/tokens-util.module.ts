import { Module } from '@nestjs/common';
import { TokensUtilService } from './tokens-util.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [TokensUtilService],
  exports: [TokensUtilService],
})
export class TokensUtilModule {}
