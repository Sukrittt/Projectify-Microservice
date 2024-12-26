import * as Bull from 'bull';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ApiResponse } from 'src/types/interfaces/api-response';

@Injectable()
export class QueueService {
  private queues: Map<string, Bull.Queue> = new Map();

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
      data: {
        count: this.queues.size,
        queueNames: Array.from(this.queues.keys()),
        queues: Array.from(this.queues.values()),
      },
    };
  }

  async removeUserFromQueue(
    userId: string,
    queueName: string,
  ): Promise<ApiResponse> {
    try {
      const queue = await this.getOrCreateQueue(queueName);

      const jobs = await queue.data.getJobs([
        'waiting',
        'active',
        'delayed',
        'paused',
      ]);

      for (const job of jobs) {
        if (job.data.userId === userId) {
          await job.remove();

          console.log(`User ${userId} removed from the queue.`);
          return {
            message: `User ${userId} removed from the queue.`,
          };
        }
      }
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to create user',
      });
    }

    return {
      message: 'User removed from all queues successfully',
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
