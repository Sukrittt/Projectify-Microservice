import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QueueConsumer } from 'src/queue/queue-consumer';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow('REDIS_HOST_ADDRESS'),
          port: configService.getOrThrow('REDIS_PORT'),
          password: configService.getOrThrow('REDIS_PASSWORD'),
          // password: 'blahhhh',
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'matchmaking',
    }),
  ],
  providers: [QueueConsumer, PrismaService],
  exports: [BullModule],
})
export class QueueModule {}
