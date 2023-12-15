import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { Request as ExpressRequest } from 'express';
import { UpdateUserProfileDto } from './dto/user.dto';
import { ResetPasswordDto } from './dto/reset.password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getProfile(@Request() req: ExpressRequest) {
    return this.userService.getUser(req['user']['username']);
  }

  @Post('update')
  updateProfile(
    @Body() body: UpdateUserProfileDto,
    @Request() req: ExpressRequest,
  ) {
    return this.userService.updateUser(req['user']['username'], body);
  }

  @Post('password/reset')
  resetPassword(
    @Body() body: ResetPasswordDto,
    @Request() req: ExpressRequest,
  ) {
    return this.userService.resetPassword(
      req['user']['username'],
      req['token'],
      body,
    );
  }
}
