import { FingerprintModule } from '@dilanjer/fingerprint';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './common/services/prisma';
import { CacheModule } from './common/services/cache';
import { DomainModule } from './domain/domain.module';
import { getFingerprintConfig } from './configs/fingerprint-config';
import { getThrottlerConfig, RATE_LIMIT_DURATION } from './configs/throttler-config';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    PassportModule.register({
      session: false,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    FingerprintModule.forRoot(getFingerprintConfig()),
    ThrottlerModule.forRoot(getThrottlerConfig()),
    PrismaModule,
    CacheModule,
    DomainModule,
    AuthModule,
    ProfileModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
