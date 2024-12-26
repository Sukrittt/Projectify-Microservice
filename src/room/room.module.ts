import { Module } from '@nestjs/common';

import { RoomService } from 'src/room/room.service';
import { QueueModule } from 'src/queue/queue.module';
// import { QueueService } from 'src/queue/queue.service';
import { RoomController } from 'src/room/room.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [QueueModule],
  controllers: [RoomController],
  providers: [RoomService, PrismaService],
})
export class RoomModule {}
