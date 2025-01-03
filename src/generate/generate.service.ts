import { Injectable } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CodingMinigamePayload } from 'src/types/generate';
import { CodingMinigameDto } from 'src/generate/dto/coding-minigame.dto';

@Injectable()
export class GenerateService {
  constructor(
    private prisma: PrismaService,
    private user: UserService,
  ) {}

  async generateCodingMinigame(codingMinigameDto: CodingMinigameDto) {
    const { clerkId } = codingMinigameDto;

    const tiers = await this.prisma.tier.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tierRange: true,
      },
    });

    const userBaseInfo = await this.user.getUserInfo(clerkId, [
      'id',
      'firstName',
      'lastName',
    ]);

    const userAddInfo = await this.prisma.additionalUserInfo.findFirst({
      where: {
        userId: userBaseInfo.data.id,
      },
      select: {
        preferredLanguage: true,
        tierProgress: true,
        tier: {
          select: {
            name: true,
          },
        },
      },
    });

    const payload: CodingMinigamePayload = {
      tiers,
      user: {
        name: `${userBaseInfo.data.firstName} ${userBaseInfo.data.lastName}`,
        language: userAddInfo?.preferredLanguage,
        profileRank: userAddInfo?.tierProgress,
        tierLevel: userAddInfo?.tier?.name,
      },
    };

    return payload;
  }
}
