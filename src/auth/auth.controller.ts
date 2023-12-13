import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.user.dto';
import { RegisterUserDto } from './dto/register.user.dto';
import { SkipAuth } from './skip.auth';
import { Request as ExpressRequest, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginUserDto, @Res() response: Response) {
    return this.authService.signIn(loginDto, response);
  }

  @SkipAuth()
  @Post('register')
  register(@Body() registerDto: RegisterUserDto, @Res() response: Response) {
    return this.authService.register(registerDto, response);
  }

  @Get('signout')
  signOut(@Request() req: ExpressRequest) {
    return this.authService.signOut(req['token']);
  }
}
