import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dto/login.user.dto';
import * as bcrypt from 'bcryptjs';
import { RegisterUserDto } from './dto/register.user.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(loginData: LoginUserDto, response: Response): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { userName: loginData?.userName },
    });
    if (!user) throw new UnauthorizedException('Invalid userName or password');

    const isPasswordMatched = await bcrypt.compare(
      loginData?.password,
      user?.password,
    );
    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid userName or password');
    }

    const payload = { id: user?.id, username: user.userName };
    const accessToken = await this.jwtService.signAsync(payload);
    response
      .cookie('vibe_app_social_media_access_token', accessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        // expires: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
      })
      .json({ message: 'User Signed In Successfully' });
  }

  async register(
    registerData: RegisterUserDto,
    response: Response,
  ): Promise<void> {
    const userNameSearch = await this.prisma.user.findUnique({
      where: { userName: registerData?.userName },
    });
    const emailSearch = await this.prisma.user.findUnique({
      where: { email: registerData?.email },
    });

    if (userNameSearch)
      throw new UnauthorizedException('Username already exists');
    if (emailSearch) throw new UnauthorizedException('Email already exists');

    const password = registerData?.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    registerData.password = hashedPassword;
    const createdUser = await this.prisma.user.create({ data: registerData });

    const payload = { id: createdUser?.id, username: createdUser.userName };
    const accessToken = await this.jwtService.signAsync(payload);
    response
      .cookie('vibe_app_social_media_access_token', accessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        // expires: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
      })
      .json({ message: 'User Registered Successfully' });
  }

  async signOut(token: string): Promise<any> {
    await this.prisma.revokedToken.create({
      data: { token: Buffer.from(token, 'utf-8') },
    });
    return { message: 'User Signed Out Successfully' };
  }

  async hasRevokedToken(token: string): Promise<boolean> {
    const revokedToken = await this.prisma.revokedToken.findFirst({
      where: { token: { equals: Buffer.from(token, 'utf-8') } },
    });
    return !!revokedToken;
  }
}
