import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';

// import { QueueService } from 'src/queue/queue.service';
import { PrismaService } from 'src/prisma/prisma.service';

type QueueInput = {
  messages: { value: string }[];
};

@Processor('matchmaking')
export class QueueConsumer {
  constructor(private prisma: PrismaService) {}
  // private queueService: QueueService,

  @Process()
  async handleJob(job: Job<QueueInput>) {
    try {
      Logger.log('Job received in queue');

      const { name } = job;

      Logger.log(`Job received in queue ${name}`, job.data);

      await this.prisma.user.update({
        where: { id: 'cm4zt97rk0000i812cgvwl9j6' },
        data: {
          gender: 'female',
        },
      });

      Logger.log('Successfully perfomed action');
    } catch (error) {
      Logger.error('Error processing message:', error);
    }
  }
}
