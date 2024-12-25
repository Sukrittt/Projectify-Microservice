import { Module } from '@nestjs/common';

import { RoomService } from 'src/room/room.service';
import { RoomController } from 'src/room/room.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService, PrismaService],
})
export class RoomModule {}
