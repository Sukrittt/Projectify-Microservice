import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import type { User, AdditionalUserInfo } from '@prisma/client';
import { InjectQueue, Process, Processor } from '@nestjs/bull';

import { pusher } from 'src/lib/pusher';
import { RoomEvent } from 'src/types/pusher';
import { personality } from 'src/constants/ai';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateContentWithGemini } from 'src/lib/gemini';
import { CodingGenerationPayload } from 'src/types/generate';
import { GenerateService } from 'src/generate/generate.service';
import { DEFAULT_QUEUE, PUSHER_CHANNELS, TIER_LEVELS } from 'src/constants';

type ExtendedUser = AdditionalUserInfo & { user: User };

type QueueInput = {
  roomId: string;
  userData: ExtendedUser;
  timestamp: number;
};

@Processor(DEFAULT_QUEUE)
export class QueueConsumer {
  constructor(
    private prisma: PrismaService,
    private generateService: GenerateService,
    @InjectQueue(DEFAULT_QUEUE) private readonly queue: Queue,
  ) {}

  @Process()
  async handleJob(job: Job<QueueInput>) {
    try {
      Logger.log(
        `Job ${job.id} received in ${DEFAULT_QUEUE} queue for ${job.data.userData.user.firstName} ${job.data.userData.user.lastName}`,
      );
      Logger.log(`Job Date: ${new Date(job.timestamp).toLocaleString()}`);

      const waitingList: Job<QueueInput>[] = await this.queue.getJobs(
        ['waiting'],
        0,
        20,
      );

      Logger.log(`Number of users in waiting list: ${waitingList.length}`);

      const filteredOpponents = this.filterOpponentsByLanguage(
        waitingList,
        job.data.userData,
      );

      Logger.log(`FilteredOpponents count: ${filteredOpponents.length}`);

      const opponent = await this.findOpponent(filteredOpponents, job.data);

      const currentDate = new Date();

      if (!opponent) {
        await this.handleNoOpponentFound(job.data);
        return;
      }

      Logger.log(
        `Opponent Found: ${
          opponent.userData.user.firstName +
          ' ' +
          opponent.userData.user.lastName
        }`,
      );

      Logger.log('Removing opponent from queue');

      await this.queue.removeJobs(opponent.userData.userId);

      Logger.log(`User room id: ${job.data.roomId}`);

      Logger.log(`Opponent room id: ${opponent.roomId}`);

      const promises = [
        this.prisma.room.update({
          where: {
            id: job.data.roomId, // current user
          },
          data: {
            status: 'MATCHED',
            matchedAt: currentDate,
          },
        }),
        this.prisma.room.update({
          where: {
            id: opponent.roomId, // opponent
          },
          data: {
            status: 'MATCHED',
            matchedAt: currentDate,
          },
        }),
      ];

      await Promise.all(promises);

      Logger.log('Removing current user from queue');

      await this.queue.removeJobs(job.id as string);
      await this.removeJob(job.id as string);

      Logger.log('Sending pusher events to both users');

      console.log('currentUser', job.data.userData);
      console.log('opponent', opponent.userData);

      const competition = await this.handleCreateCompetition(
        job.data.userData,
        opponent.userData,
      );

      const opponentPayload = this.getRoomPayload(opponent.userData);
      const currentUserPayload = this.getRoomPayload(job.data.userData);

      const pusherPromises = [
        pusher.trigger(
          `user-${job.data.userData.userId}-room`, // current user
          PUSHER_CHANNELS.MATCH_MAKING,
          { ...opponentPayload, competitionId: competition.id }, // send opponent payload
        ),
        pusher.trigger(
          `user-${opponent.userData.userId}-room`, // opponent
          PUSHER_CHANNELS.MATCH_MAKING,
          { ...currentUserPayload, competitionId: competition.id }, // send current user payload
        ),
      ];

      await Promise.all(pusherPromises);

      Logger.log('Successfully perfomed action');
    } catch (error) {
      console.log('Error finding opponents:', error);
      Logger.error('Error finding opponents:', error);
    }
  }

  async findOpponent(
    opponents: Job<QueueInput>[],
    currentUser: QueueInput,
  ): Promise<QueueInput> {
    const currentUserTierProgress = currentUser.userData.tierProgress;
    let minDifference = Infinity;

    let opponent = null;

    opponents.forEach((waitingJob) => {
      const { userData } = waitingJob.data;

      const tierProgressDifference = Math.abs(
        currentUserTierProgress - userData.tierProgress,
      );

      if (tierProgressDifference < minDifference) {
        minDifference = tierProgressDifference;
        opponent = waitingJob.data;
      }
    });

    return opponent;
  }

  filterOpponentsByLanguage(
    waitingList: Job<QueueInput>[],
    currentUser: ExtendedUser,
  ): Job<QueueInput>[] {
    const filterCurrentUserList = waitingList.filter(
      (opponent) => opponent.data.userData.userId !== currentUser.userId,
    );

    return filterCurrentUserList.filter(
      (opponent) =>
        opponent.data.userData.preferredLanguage ===
        currentUser.preferredLanguage,
    );
  }

  async handleNoOpponentFound(currentUser: QueueInput) {
    const currentDate = new Date();
    const jobCreationTime = new Date(currentUser.timestamp);

    const timeDifference = currentDate.getTime() - jobCreationTime.getTime();

    const fiveMinutes = 5 * 60 * 1000;

    if (timeDifference < fiveMinutes) {
      Logger.log('Adding user to queue again');

      await this.removeJob(currentUser.userData.userId);

      this.queue.add(currentUser, {
        jobId: currentUser.userData.userId,
        removeOnComplete: true,
      });

      return;
    }

    // In this case no opponent found and 5 minutes have passed
    Logger.log('No opponent found');

    // await this.prisma.room.delete({ where: { id: currentUser.roomId } });

    await pusher.trigger(
      `user-${currentUser.userData.userId}-room`, // current user
      PUSHER_CHANNELS.MATCH_MAKING,
      { type: 'match-not-found' },
    );
  }
  async removeJob(jobId: string) {
    const existingJob = await this.queue.getJob(jobId);

    if (!existingJob) return;

    Logger.log('Removing existing job');

    await existingJob.moveToCompleted();
    await existingJob.remove();
  }

  async handleCreateCompetition(
    user: QueueInput['userData'],
    opponent: QueueInput['userData'],
  ) {
    const userGeneratePayload =
      await this.generateService.generateCodingMinigame({
        clerkId: user.userId,
      });

    const opponentGeneratePayload =
      await this.generateService.generateCodingMinigame({
        clerkId: opponent.userId,
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

    const { question, endDateTime } = JSON.parse(
      generatedPayload,
    ) as CodingGenerationPayload;

    console.log('Generated Question', question);

    const competition = await this.prisma.competition.create({
      data: {
        question,
        endDateTime,
        participants: {
          createMany: {
            data: [
              {
                userId: user.userId,
              },
              {
                userId: opponent.userId,
              },
            ],
          },
        },
      },
    });

    return competition;
  }

  getRoomPayload(userInfo: QueueInput['userData']): RoomEvent {
    const payload: RoomEvent = {
      type: 'match-found',
      user: {
        name: userInfo.user.firstName + ' ' + userInfo.user.lastName,
        language: userInfo.preferredLanguage,
        profileRank: userInfo?.tierProgress ?? 0,
        tierLevel: TIER_LEVELS[userInfo.tierId],
        avatar: userInfo.user.avatarConfig,
      },
    };

    return payload;
  }
}
