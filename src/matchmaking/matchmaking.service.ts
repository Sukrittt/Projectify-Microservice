import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdditionalUserInfo, Room, RoomStatus, User } from '@prisma/client';

import { pusher } from 'src/lib/pusher';
import { RoomEvent } from 'src/types/pusher';
import { personality } from 'src/constants/ai';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateContentWithGemini } from 'src/lib/gemini';
import { CodingGenerationPayload } from 'src/types/generate';
import { PUSHER_CHANNELS, TIER_LEVELS } from 'src/constants';
import { GenerateService } from 'src/generate/generate.service';

@Injectable()
export class MatchMakingService {
  private readonly logger = new Logger(MatchMakingService.name);

  constructor(
    private prisma: PrismaService,
    private generateService: GenerateService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleMatchMatckingCron() {
    this.logger.debug('Matchmaking cron job called 🚨');

    // TODO: Wrap in transaction to prevent race conditions.
    // await this.prisma.$transaction(async () => {
    //1. Find users in the waiting list.
    const usersInWaitingList = (await this.prisma.$queryRawUnsafe(`
        SELECT * FROM "Room"
        WHERE status = 'WAITING' 
        AND "lastPing" > NOW() - INTERVAL '10 seconds'
        ORDER BY "createdAt"
        FOR UPDATE SKIP LOCKED
        LIMIT 10
      `)) as Room[];

    if (usersInWaitingList.length === 0) {
      this.logger.debug('No users in waiting list');
      return;
    }

    const matchedRoomIds = new Set<string>();

    for (const waitingList of usersInWaitingList) {
      if (matchedRoomIds.has(waitingList.id)) continue;

      try {
        // 2. Find user information for finding best match.
        const user = await this.prisma.user.findFirst({
          where: {
            id: waitingList.userId,
          },
          include: {
            additionalInfo: true,
          },
        });

        // Update room status to processing.
        await this.updateRoomStatus([waitingList.id], 'PROCESSING');

        const opponents = usersInWaitingList.filter(
          (opponent) => opponent.userId !== user.id,
        );

        const opponent = await this.findOpponent(opponents, user);

        if (!opponent) {
          await this.updateRoomStatus([waitingList.id], 'WAITING');
          continue;
        }

        this.logger.debug('Opponent Found!');

        await this.updateRoomStatus([waitingList.id, opponent.id], 'MATCHED');

        const opponentData = await this.prisma.user.findFirst({
          where: {
            id: opponent.userId,
          },
          include: {
            additionalInfo: true,
          },
        });

        // 3. Create competiton for both users.
        const competition = await this.handleCreateCompetition(
          user,
          opponentData,
        );

        this.logger.debug('Competition created');

        const opponentPayload = this.getRoomPayload(opponentData);
        const currentUserPayload = this.getRoomPayload(user);

        // 4. Send pusher events to both users.
        const pusherPromises = [
          pusher.trigger(
            `user-${user.id}-room`, // current user
            PUSHER_CHANNELS.MATCH_MAKING,
            { ...opponentPayload, competitionId: competition.id }, // send opponent payload
          ),
          pusher.trigger(
            `user-${opponent.userId}-room`, // opponent
            PUSHER_CHANNELS.MATCH_MAKING,
            { ...currentUserPayload, competitionId: competition.id }, // send current user payload
          ),
        ];

        await Promise.all(pusherPromises);

        // Add users to matched room ids.
        matchedRoomIds.add(waitingList.id);
        matchedRoomIds.add(opponent.id);

        this.logger.debug('Pusher events sent to both users');

        this.logger.debug(
          `Matchmaking cron job completed for ${user.id} and ${opponent.id}`,
        );
      } catch (error) {
        this.logger.error(`Error processing user ${waitingList.userId}`, error);
        await this.updateRoomStatus([waitingList.id], 'WAITING');
      }
    }

    this.logger.debug(`Matchmaking cron job completed 🚀 at ${new Date()}`);
    // });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupStaleRooms() {
    this.logger.debug('[Cleanup] Checking for stale rooms 🧹');

    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    const rooms = await this.prisma.room.updateMany({
      where: {
        status: 'WAITING',
        lastPing: { lt: thirtySecondsAgo },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    this.logger.debug(`[Cleanup] Marked ${rooms.count} rooms as EXPIRED`);
  }

  async findOpponent(
    opponents: Room[],
    currentUser: User & { additionalInfo: AdditionalUserInfo },
  ) {
    const currentUserTierProgress = currentUser.additionalInfo.tierProgress;
    let minDifference = Infinity;
    let bestOpponent: Room | null = null;

    for (const opponentData of opponents) {
      const userData = await this.prisma.user.findFirst({
        where: { id: opponentData.userId },
        include: { additionalInfo: true },
      });

      if (!userData?.additionalInfo) continue;

      const tierProgressDifference = Math.abs(
        currentUserTierProgress - userData.additionalInfo.tierProgress,
      );

      if (tierProgressDifference < minDifference) {
        minDifference = tierProgressDifference;
        bestOpponent = opponentData;
      }
    }

    return bestOpponent;
  }
  async updateRoomStatus(roomIds: string[], status: RoomStatus) {
    await this.prisma.room.updateMany({
      where: {
        id: { in: roomIds },
      },
      data: {
        status,
        matchedAt: new Date(),
      },
    });
  }

  async handleCreateCompetition(user: User, opponent: User) {
    const userGeneratePayload =
      await this.generateService.generateCodingMinigame({
        clerkId: user.clerkId,
      });

    const opponentGeneratePayload =
      await this.generateService.generateCodingMinigame({
        clerkId: opponent.clerkId,
      });

    const genPayload = {
      tiers: userGeneratePayload['tiers'],
      userOne: JSON.stringify(userGeneratePayload['user']),
      userTwo: JSON.stringify(opponentGeneratePayload['user']),
    };

    const generatedPayload = await generateContentWithGemini(
      JSON.stringify(genPayload),
      personality.COMPETITION_QUESTION_GENERATION,
    );

    const { question, endDateTime } = this.extractAndParseJSON(
      generatedPayload,
    ) as CodingGenerationPayload;

    const competition = await this.prisma.competition.create({
      data: {
        question,
        endDateTime,
        participants: {
          createMany: {
            data: [
              {
                userId: user.id,
              },
              {
                userId: opponent.id,
              },
            ],
          },
        },
      },
      select: { id: true },
    });

    return competition;
  }
  extractAndParseJSON(response: string) {
    const match = response?.match(/\$\$\$\$(.*?)\$\$\$\$/s);
    if (!match) return null;

    try {
      const formattedResponse = match[1].trim();

      return JSON.parse(formattedResponse);
    } catch (error) {
      console.error('Invalid JSON:', error);
      return null;
    }
  }

  getRoomPayload(
    user: User & { additionalInfo: AdditionalUserInfo },
  ): RoomEvent {
    const payload: RoomEvent = {
      type: 'match-found',
      user: {
        name: user.firstName + ' ' + user.lastName,
        language: user.additionalInfo.preferredLanguage,
        profileRank: user.additionalInfo.tierProgress ?? 0,
        tierLevel: TIER_LEVELS[user.additionalInfo.tierId],
        avatar: user.avatarConfig,
      },
    };

    return payload;
  }
}
