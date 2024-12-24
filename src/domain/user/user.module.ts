import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCacheHelperService } from './user-cache-helper.service';

@Module({
  providers: [UserService, UserCacheHelperService],
  exports: [UserService],
})
export class UserModule {}
