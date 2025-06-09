import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PingDto } from './dto/ping.dto';
import { DEFAULT_QUEUE } from 'src/constants';
import { UserService } from 'src/user/user.service';
import { JoinRoomDto } from 'src/room/dto/join-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/types/interfaces/api-response';

@Injectable()
export class RoomService {
  constructor(
    private prisma: PrismaService,
    private user: UserService,
    @InjectQueue(DEFAULT_QUEUE) private readonly queue: Queue,
  ) {}

  async getRoom(clerkId: string): Promise<ApiResponse> {
    try {
      const { data: existingUser } = await this.user.getUserInfo(clerkId, [
        'id',
      ]);

      const existingRoom = await this.prisma.room.findFirst({
        where: {
          userId: existingUser.id,
          status: 'WAITING',
        },
        select: { id: true, createdAt: true },
      });

      if (!existingRoom) {
        throw new InternalServerErrorException({
          message: "We couldn't find this room.",
        });
      }

      return {
        message: 'Successfully fetched room.',
        data: { ...existingRoom, userId: existingUser.id },
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to fetch room.',
      });
    }
  }

  async getEstimatedQueueTime(clerkId: string): Promise<ApiResponse> {
    try {
      const { data: existingUser } = await this.user.getUserInfo(clerkId, [
        'id',
      ]);

      const userAddInfo = await this.prisma.additionalUserInfo.findFirst({
        where: {
          userId: existingUser.id,
        },
        select: {
          tierId: true,
        },
      });

      const rooms = await this.prisma.room.findMany({
        where: {
          status: 'MATCHED',
          matchedAt: {
            not: null,
          },
          user: {
            additionalInfo: {
              tierId: userAddInfo?.tierId,
            },
          },
        },
        select: {
          createdAt: true,
          matchedAt: true,
        },
      });

      if (rooms.length === 0) return;

      const totalMatchTime = rooms.reduce((total, room) => {
        const createdAt = new Date(room.createdAt);
        const matchedAt = new Date(room.matchedAt!);

        const timeDifference = matchedAt.getTime() - createdAt.getTime();
        return total + timeDifference;
      }, 0);

      const averageMatchTimeMs = totalMatchTime / rooms.length;

      const averageMatchTimeSeconds = averageMatchTimeMs / 1000;

      return {
        data: averageMatchTimeSeconds,
        message: 'Successfully fetched estimated queue time.',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to fetch estimated queue time.',
      });
    }
  }

  async joinRoom(joinRoomDto: JoinRoomDto): Promise<ApiResponse> {
    try {
      const { clerkId } = joinRoomDto;

      const { data: existingUser } = await this.user.getUserInfo(clerkId, [
        'id',
      ]);

      const room = await this.prisma.room.create({
        data: {
          userId: existingUser.id,
        },
        select: { id: true },
      });

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

  async pingRoom(roomId: string, pingData: PingDto): Promise<ApiResponse> {
    try {
      const { clerkId } = pingData;

      const { data: existingUser } = await this.user.getUserInfo(clerkId, [
        'id',
      ]);

      const room = await this.prisma.room.findFirst({
        where: {
          id: roomId,
          userId: existingUser.id,
        },
      });

      if (!room) {
        throw new InternalServerErrorException({
          message: 'Room not found.',
        });
      }

      await this.prisma.room.update({
        where: {
          id: roomId,
        },
        data: {
          lastPing: new Date(),
        },
      });

      return {
        message: 'User pinged successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to create room',
      });
    }
  }
}
