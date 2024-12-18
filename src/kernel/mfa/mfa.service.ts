import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '@/common/services/prisma';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class MfaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
    private readonly userService: UserService,
  ) {}

  async create() {}
  async update() {}
  async delete() {}

  async createTemporaryTOTP() {}
  async verifyTOTP() {}
  async verifyEnrollTOTP() {}
  async findManyWithUserIdTOTP() {}
}
