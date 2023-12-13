import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(userName: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { userName } });
    if (!user) throw new UnauthorizedException('Invalid Username provided');
    return user;
  }
}
