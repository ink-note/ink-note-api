import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { SessionModule } from './session';
import { JwtModule } from '@nestjs/jwt';
import { MfaModule } from './mfa/mfa.module';

@Module({
  imports: [UserModule, SessionModule, MfaModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
