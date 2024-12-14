import { Body, Controller, Get, Post } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { AuthGuard } from '@/common/guards/auth';
import { CurrentUser } from '@/common/decorators/Current-user';
import { CurrentUserType } from '../auth/types';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VerifyEnrollDto } from './dtos/Verify-enroll.dto';

@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @AuthGuard()
  @ApiBearerAuth()
  @Get('create-mfa')
  async createTemp(@CurrentUser() currentUser: CurrentUserType) {
    return await this.mfaService.createTemporary(currentUser);
  }

  @AuthGuard()
  @ApiBearerAuth()
  @Post('verify-enroll')
  async verify(@CurrentUser() currentUser: CurrentUserType, @Body() body: VerifyEnrollDto) {
    return await this.mfaService.verifyEnroll(currentUser, body);
  }
}
