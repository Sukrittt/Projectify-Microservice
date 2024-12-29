import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { DEFAULT_QUEUE } from 'src/constants';
import { JoinRoomDto } from 'src/room/dto/join-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/types/interfaces/api-response';

@Injectable()
export class RoomService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(DEFAULT_QUEUE) private readonly queue: Queue,
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

      // Delete all the waiting rooms of the user.
      await this.prisma.room.deleteMany({
        where: {
          userId: existingUser.id,
          status: 'WAITING',
        },
      });

      const promises = [
        this.prisma.room.create({
          data: {
            userId: existingUser.id,
          },
          select: { id: true },
        }),
        this.prisma.additionalUserInfo.findFirst({
          where: {
            userId: existingUser.id,
          },
          include: {
            user: true,
          },
        }),
      ];

      const [room, additionalUserInfo] = await Promise.all(promises);

      await this.queue.clean(0, 'completed');

      const currentTime = Date.now();

      await this.queue.removeJobs(existingUser.id);

      this.queue.add(
        {
          roomId: room.id,
          userData: additionalUserInfo,
          timestamp: currentTime,
        },
        { jobId: existingUser.id, removeOnComplete: true }, // identify every job as a user
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
