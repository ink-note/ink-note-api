import { MfaService } from '@/modules/mfa/mfa.service';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(private readonly mfaService: MfaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const sessionId = request.cookies['2fa-token'];

    if (!sessionId) {
      throw new ForbiddenException('2FA verification required.');
    }

    return true;
  }
}
