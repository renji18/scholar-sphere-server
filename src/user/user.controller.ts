import { Controller, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { Request as ExpressRequest } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getProfile(@Request() req: ExpressRequest) {
    return this.userService.getUser(req['user']['username']);
  }
}
