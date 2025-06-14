import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { RoomService } from 'src/room/room.service';
import { JoinRoomDto } from 'src/room/dto/join-room.dto';
import { PingDto } from './dto/ping.dto';

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
  joinRoom(@Body() joinRoomDto: JoinRoomDto) {
    return this.roomService.joinRoom(joinRoomDto);
  }

  @Post('/:roomId/ping')
  ping(@Param('roomId') roomId: string, @Body() pingData: PingDto) {
    return this.roomService.pingRoom(roomId, pingData);
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
