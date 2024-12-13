import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Param } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  @ApiBody({
    type: CreateUserDto,
    required: true,
    description: 'User data received from clerk webhook.',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get('/:userId/getOnboardingStatus')
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'The id of the user.',
  })
  getOnboardingStatus(@Param('userId') userId: string) {
    return this.userService.getOnboardingStatus(userId);
  }
}
