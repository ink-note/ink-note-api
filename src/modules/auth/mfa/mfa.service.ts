import { PrismaService } from '@/common/services/prisma';
import { MfaData, MfaEntity } from '@/common/types';
import { Pick } from '@/shared/utils/object';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { SessionService } from '../session';
import { UserService } from '@/modules/user/user.service';
import { nullIfEmpty } from '@/shared/utils/array';

@Injectable()
export class MfaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  enable() {}

  async findMany(mfaWhereInput: Prisma.MfaFindManyArgs): Promise<MfaEntity[] | null> {
    return nullIfEmpty(await this.prisma.mfa.findMany(mfaWhereInput));
  }

  createTemporaryToken() {
    return nanoid(32);
  }

  regenerateBackupCodes() {}

  getMfaPublicData(mfa: MfaEntity): MfaData {
    return Pick(mfa, ['enabled', 'friendlyName', 'type', 'id', 'createdAt']);
  }
}
