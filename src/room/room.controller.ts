import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { RoomService } from 'src/room/room.service';
import { JoinRoomDto } from 'src/room/dto/join-room.dto';

@ApiTags('Room')
@ApiBearerAuth()
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('/:clerkId')
  @ApiParam({
    name: 'clerkId',
    required: true,
    description: 'The clerk id of the user.',
  })
  getRoom(@Param('clerkId') clerkId: string) {
    return this.roomService.getRoom(clerkId);
  }

  @Post('/join')
  @ApiBody({
    type: JoinRoomDto,
    required: true,
    description: 'User to be added to a room.',
  })
  updateUser(@Body() joinRoomDto: JoinRoomDto) {
    return this.roomService.joinRoom(joinRoomDto);
  }

  @Get('/getEstimatedQueueTime/:clerkId')
  @ApiParam({
    name: 'clerkId',
    required: true,
    description: 'The clerk id of the user.',
  })
  getEstimatedQueueTime(@Param('clerkId') clerkId: string) {
    return this.roomService.getEstimatedQueueTime(clerkId);
  }
}
