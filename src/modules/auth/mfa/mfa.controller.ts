import { Body, Controller, Get, Post } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { AuthGuard } from '@/common/guards/auth';
import { User } from '@/common/decorators/User';
import { UserType } from '../types';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VerifyEnrollDto } from './dtos/Verify-enroll.dto';

@Controller('mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @AuthGuard()
  @ApiBearerAuth()
  @Get('create-mfa')
  async createTemp(@User() user: UserType) {
    return await this.mfaService.createTemporary(user);
  }

  @AuthGuard()
  @ApiBearerAuth()
  @Post('verify-enroll')
  async verify(@User() user: UserType, @Body() body: VerifyEnrollDto) {
    return await this.mfaService.verifyEnroll(user, body);
  }
}
