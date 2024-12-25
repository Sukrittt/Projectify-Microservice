import Bull, { Queue } from 'bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiResponse } from 'src/types/interfaces/api-response';

@Injectable()
export class QueueService {
  private queues: Map<string, Queue> = new Map();

  constructor(private configService: ConfigService) {}

  async getOrCreateQueue(queueName: string): Promise<ApiResponse> {
    if (this.queues.has(queueName)) {
      return {
        message: `Queue ${queueName} already exists.`,
        data: this.queues.get(queueName),
      };
    }

    const redisConfig = {
      host: this.configService.getOrThrow('REDIS_HOST_ADDRESS'),
      port: this.configService.getOrThrow('REDIS_PORT'),
      password: this.configService.getOrThrow('REDIS_PASSWORD'),
    };

    const queue = new Bull(queueName, { redis: redisConfig });
    this.queues.set(queueName, queue);

    return {
      message: `Queue ${queueName} created successfully.`,
      data: queue,
    };
  }

  getAllQueues(): ApiResponse {
    return {
      message: 'Sucessfully fetched all queues',
      data: Array.from(this.queues.values()),
    };
  }

  async deleteQueue(queueName: string): Promise<ApiResponse> {
    if (this.queues.has(queueName)) {
      const queue = this.queues.get(queueName);

      await queue.close();

      this.queues.delete(queueName);

      console.log(`Queue ${queueName} deleted successfully.`);

      return {
        message: `Queue ${queueName} deleted successfully.`,
      };
    }

    console.log(`Queue ${queueName} not found.`);

    return {
      message: `Queue ${queueName} not found.`,
    };
  }
}
