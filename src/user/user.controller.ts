import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiBody, ApiQuery, ApiParam, ApiTags } from '@nestjs/swagger';

import { UserService } from 'src/user/user.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateClerkUserDto } from 'src/user/dto/update-clerk-user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Get('/:clerkId')
  @ApiParam({
    name: 'clerkId',
    required: true,
    description: 'The clerk id of the user.',
  })
  @ApiQuery({
    name: 'attributes',
    required: false,
    description: 'Comma-separated list of attributes to fetch.',
  })
  getUserInfo(
    @Param('clerkId') clerkId: string,
    @Query('attributes') attributes?: string,
  ) {
    const validAttributes: (keyof User)[] = [
      'id',
      'firstName',
      'lastName',
      'username',
      'gender',
      'clerkId',
      'profileImageUrl',
      'avatarConfig',
      'birthday',
      'primaryEmailAddressId',
      'createdAt',
      'updatedAt',
    ];

    const attributeList = attributes
      ? attributes
          .split(',')
          .filter((attr): attr is keyof User =>
            validAttributes.includes(attr as keyof User),
          )
      : [];

    if (attributes && attributeList.length === 0) {
      throw new BadRequestException('No valid attributes specified.');
    }

    return this.userService.getUserInfo(clerkId, attributeList);
  }
}

@ApiTags('Clerk')
@ApiBearerAuth()
@Controller('clerk/users')
export class ClerkController {
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

  @Post('/update')
  @ApiBody({
    type: UpdateClerkUserDto,
    required: true,
    description: 'User data received from clerk webhook.',
  })
  updateUser(@Body() updateUserDto: UpdateClerkUserDto) {
    return this.userService.updateClerkUser(updateUserDto);
  }
}
