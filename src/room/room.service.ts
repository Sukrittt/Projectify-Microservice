import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { ApiResponse } from 'src/types/interfaces/api-response';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(createRoomDto: CreateRoomDto): Promise<ApiResponse> {
    try {
      const { clerkId } = createRoomDto;

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

      const room = await this.prisma.room.create({
        data: {
          userId: existingUser.id,
        },
        select: { id: true },
      });

      // Trigger a task here which will delete the room after 5 mins.

      return {
        message: 'Room created successfully',
        data: room,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to create user',
      });
    }
  }
}
