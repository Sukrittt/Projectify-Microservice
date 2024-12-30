import { Module } from '@nestjs/common';

import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';
import { QueueModule } from 'src/queue/queue.module';
import { RoomController } from 'src/room/room.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [QueueModule],
  controllers: [RoomController],
  providers: [RoomService, PrismaService, UserService],
})
export class RoomModule {}
