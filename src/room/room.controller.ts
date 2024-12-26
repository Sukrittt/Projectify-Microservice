import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { RoomService } from 'src/room/room.service';
import { JoinRoomDto } from 'src/room/dto/join-room.dto';

@ApiTags('Room')
@ApiBearerAuth()
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/join')
  @ApiBody({
    type: JoinRoomDto,
    required: true,
    description: 'User to be added to a room.',
  })
  updateUser(@Body() joinRoomDto: JoinRoomDto) {
    return this.roomService.joinRoom(joinRoomDto);
  }
}
