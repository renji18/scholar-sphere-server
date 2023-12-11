import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  findOne(@Param('id') id: string): string {
    console.log(id);
    return `This action returns a #${id} user`;
  }
}
