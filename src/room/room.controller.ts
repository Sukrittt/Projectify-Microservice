import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { RoomService } from 'src/room/room.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';

@ApiTags('Room')
@ApiBearerAuth()
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/create')
  @ApiBody({
    type: CreateRoomDto,
    required: true,
    description: 'User data to be updated.',
  })
  updateUser(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto);
  }
}
