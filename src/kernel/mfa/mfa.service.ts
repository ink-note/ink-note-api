import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma';
import { CacheService } from '@/common/services/cache';
import { FindManyByUserId } from './types';
import { EntityBase } from '../entity-base.service';

@Injectable()
export class MfaService extends EntityBase {
  constructor(
    private readonly prismaService: PrismaService,
    readonly cacheService: CacheService,
  ) {
    super(cacheService);
  }

  findManyByUserId({ userId }: FindManyByUserId) {}

  private generateCacheKey(id: string): string {
    return this.cacheService.generateKey('mfa', 'cache', id);
  }
}
