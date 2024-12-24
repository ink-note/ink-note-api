import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UserModule } from '@/domain/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
