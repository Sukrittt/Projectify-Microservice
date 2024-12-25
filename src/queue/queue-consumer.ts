import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';

import { QueueService } from 'src/queue/queue.service';

interface JobPayload {
  userId: string;
  roomId: string;
}

@Processor()
export class QueueConsumer {
  constructor(private queueService: QueueService) {}

  @Process()
  async handleJob(job: Job<JobPayload>) {
    const { name } = job;

    console.log(`Job received in queue ${name}`, job.data);
  }
}
