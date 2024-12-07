import { Controller } from '@nestjs/common';
import { MfaService } from './mfa.service';

@Controller('auth/mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}
}
