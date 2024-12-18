import { ApiBody } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { UpdateUserDto } from './dto/update-user.dto';
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

  @Patch('/:clerkId')
  @ApiParam({
    name: 'clerkId',
    required: true,
    description: 'The id of the user.',
  })
  @ApiBody({
    type: UpdateUserDto,
    required: true,
    description: 'User data to be updated.',
  })
  updateUser(
    @Param('clerkId') clerkId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(clerkId, updateUserDto);
  }

  @Get('/:clerkId/getOnboardingStatus')
  @ApiParam({
    name: 'clerkId',
    required: true,
    description: 'The clerk id of the user.',
  })
  getOnboardingStatus(@Param('clerkId') clerkId: string) {
    return this.userService.getOnboardingStatus(clerkId);
  }
}
