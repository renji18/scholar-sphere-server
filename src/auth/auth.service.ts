import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login.user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { RegisterUserDto } from './dto/register.user.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signIn(loginData: LoginUserDto): Promise<User> {
    const user = await this.userService.findUserByUserName(loginData?.userName);
    if (!user) throw new UnauthorizedException('Invalid userName or password');
    const isPasswordMatched = await bcrypt.compare(
      loginData?.password,
      user?.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    console.log(result);
    console.log(password);
    return user;
  }

  async register(registerData: RegisterUserDto): Promise<User> {
    const userNameSearch = await this.userService.findUserByUserName(
      registerData?.userName,
    );
    const emailSearch = await this.userService.findUserByEmail(
      registerData?.email,
    );

    if (userNameSearch)
      throw new UnauthorizedException('Username already exists');
    if (emailSearch) throw new UnauthorizedException('Email already exists');

    const password = registerData?.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    registerData.password = hashedPassword;
    return this.userService.createUser(registerData);
  }
}
