import { FingerprintModule } from '@dilanjer/fingerprint';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { toMs } from 'ms-typescript';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { COOKIES } from './shared/constants/enums/cookies';
import { PrismaModule } from './common/services/prisma';
import { CacheModule } from './common/services/cache';
import { MfaModule } from './modules/mfa/mfa.module';

@Module({
  imports: [
    PassportModule.register({
      session: false,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    FingerprintModule.forRoot({
      params: ['headers', 'userAgent', 'ipAddress', 'location'],
      cookieOptions: {
        name: COOKIES.FINGERPRINT_ID,
        httpOnly: true,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: toMs('2m'),
        limit: 60,
      },
    ]),
    AuthModule,
    UserModule,
    MfaModule,
    PrismaModule,
    CacheModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
