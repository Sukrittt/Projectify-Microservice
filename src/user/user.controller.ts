import { ApiTags } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Post, Body } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiBody({
    type: CreateUserDto,
    required: true,
    description: 'User data needs to be passed.',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    console.log('webhook successfully triggered');
    return this.userService.createUser(createUserDto);
  }
}
