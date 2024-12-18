import { Body, Controller, Get, Post } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { AuthGuard } from '@/common/guards/auth';
import { User } from '@/common/decorators/User';
import { UserType } from '../types';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VerifyEnrollDto } from './dtos/Verify-enroll.dto';
import { ROUTES } from '@/common/constants/routes';

@Controller(ROUTES.MFA.BASE)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @AuthGuard()
  @ApiBearerAuth()
  @Get(ROUTES.MFA.CREATE_MFA)
  async createTemp(@User() user: UserType) {
    return await this.mfaService.createTemporaryMfa(user);
  }

  @AuthGuard()
  @ApiBearerAuth()
  @Post(ROUTES.MFA.VERIFY_ENROLL)
  async verify(@User() user: UserType, @Body() body: VerifyEnrollDto) {
    return await this.mfaService.verifyEnrollMfa(user, body);
  }
}
