import { PrismaService } from '@/common/services/prisma';
import { Pick } from '@/shared/utils/object';
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { CreateUserInput } from './types';
import { UserProfile } from '@/common/types';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ firstName, lastName, ...rest }: CreateUserInput): Promise<User> {
    const fullName = `${firstName} ${lastName}`;
    return await this.prisma.user.create({
      data: {
        fullName,
        firstName,
        lastName,
        ...rest,
      },
    });
  }

  async update(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params;
    return await this.prisma.user.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async findOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput, include?: Prisma.UserInclude): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include,
    });
  }

  getUserPublicData(user: User): UserProfile {
    return Pick(user, ['firstName', 'fullName', 'imageUrl', 'lastName', 'id', 'hasVerifiedEmailAddress', 'email']);
  }
}
