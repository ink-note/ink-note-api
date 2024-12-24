import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AccessTokenGuard } from '@/common/guard/access-token.guard';
import { User } from '@/common/decorators/User';
import { UserProfile } from '@/domain/types';

@UseGuards(AccessTokenGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  getProfile(@User() user: UserProfile) {
    return this.profileService.profile(user);
  }
}
