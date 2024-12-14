import { CacheModule as CacheModuleCore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { Global, Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import { ConfigService } from '@nestjs/config';

import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModuleCore.registerAsync<RedisClientOptions>({
      useFactory: async (configService: ConfigService<EnvironmentVariables>) => ({
        store: await redisStore(),
        socket: {
          host: configService.get<string>('REDIS_HOST'),
          port: parseInt(configService.get<string>('REDIS_PORT')),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
