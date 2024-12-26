import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

// import { QueueService } from 'src/queue/queue.service';
import { QUEUE_NAME } from 'src/constants';
import { JoinRoomDto } from 'src/room/dto/join-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/types/interfaces/api-response';

@Injectable()
export class RoomService {
  constructor(
    private prisma: PrismaService,
    // private queueService: QueueService,
    @InjectQueue(QUEUE_NAME) private readonly generateQueue: Queue,
  ) {}

  async joinRoom(joinRoomDto: JoinRoomDto): Promise<ApiResponse> {
    try {
      const { clerkId } = joinRoomDto;

      const existingUser = await this.prisma.user.findFirst({
        where: {
          clerkId,
        },
        select: { id: true },
      });

      if (!existingUser) {
        throw new InternalServerErrorException({
          message: "We couldn't find your account.",
        });
      }

      // const { data: queue } =
      //   await this.queueService.getOrCreateQueue('matchmaking-queue');

      const promises: any = [
        // Delete all the waiting rooms of the user.
        this.prisma.room.deleteMany({
          where: {
            userId: existingUser.id,
            status: 'WAITING',
          },
        }),
      ];

      // if (queue) {
      //   promises.push(
      //     // TODO: Manage dynamic queues.
      //     this.queueService.removeUserFromQueue(
      //       existingUser.id,
      //       'matchmaking-queue',
      //     ),
      //   );
      // }

      await Promise.all(promises);

      const room = await this.prisma.room.create({
        data: {
          userId: existingUser.id,
        },
        select: { id: true },
      });

      // const { data: queue } =
      //   await this.queueService.getOrCreateQueue('matchmaking-queue');

      // queue.add({ userId: existingUser.id, roomId: room.id });
      // this.generateQueue.add({
      //   userId: existingUser.id,
      //   roomId: room.id,
      // });

      console.log('room', room);

      this.generateQueue.add({
        messages: [
          {
            value: JSON.stringify({
              grantId: '123',
              nylasAccountId: '123',
              type: 'onboard',
            }),
          },
        ],
      });

      console.log(
        'this.generateQueue.client.status',
        this.generateQueue.client.status,
      );

      return {
        message: 'Room joined successfully',
        data: room,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to create room',
      });
    }
  }
}
