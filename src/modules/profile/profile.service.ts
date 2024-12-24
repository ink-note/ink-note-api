import { UserEntity, UserProfile } from '@/domain/types';
import { UserService } from '@/domain/user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UserService) {}

  async profile(user: UserProfile) {
    return user;
  }
}
