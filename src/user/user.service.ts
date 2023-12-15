import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserProfileDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { ResetPasswordDto } from './dto/reset.password.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(userName: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { userName } });
    if (!user) throw new UnauthorizedException('Invalid Username provided');
    return user;
  }

  async updateUser(
    userName: string,
    data: UpdateUserProfileDto,
  ): Promise<{ user: User; message: string }> {
    const user = await this.prisma.user.update({
      where: {
        userName,
      },
      data,
    });
    return { user, message: 'User Updated Successfully' };
  }

  async resetPassword(
    userName: string,
    token: string,
    data: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { userName } });
    const isPasswordMatched = await bcrypt.compare(
      data?.password,
      user?.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid userName or password');
    }
    if (data?.confirmPassword !== data?.newPassword) {
      throw new UnauthorizedException("Passwords don't match");
    }

    const hashedPassword = await bcrypt.hash(data?.newPassword, 10);
    await this.prisma.user.update({
      where: { userName },
      data: { password: hashedPassword },
    });
    await this.prisma.revokedToken.create({
      data: { token: Buffer.from(token, 'utf-8') },
    });

    return { message: 'Password Updated Successfully, Please Login Again' };
  }
}
