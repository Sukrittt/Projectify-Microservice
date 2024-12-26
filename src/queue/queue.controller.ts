import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { QueueService } from 'src/queue/queue.service';
import { GetCreateQueueDto } from 'src/queue/dto/get-create-queue.dto';

@ApiTags('Queue')
@ApiBearerAuth()
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('/')
  @ApiBody({
    type: GetCreateQueueDto,
    required: true,
    description: 'Get or create a queue.',
  })
  getCreateQueue(@Body() getCreateRoomDto: GetCreateQueueDto) {
    return this.queueService.getOrCreateQueue(getCreateRoomDto.queueName);
  }

  @Get('/all')
  getAllQueues() {
    return this.queueService.getAllQueues();
  }

  @Delete('/:queueName')
  @ApiParam({
    name: 'queueName',
    required: true,
    description: 'The name of the queue.',
  })
  deleteQueue(@Param('queueName') queueName: string) {
    return this.queueService.deleteQueue(queueName);
  }

  @Delete('/:queueName/:userId')
  @ApiParam({
    name: 'queueName',
    required: true,
    description: 'The name of the queue.',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'The id of the user.',
  })
  removeUserFromQueue(
    @Param('userId') userId: string,
    @Param('queueName') queueName: string,
  ) {
    return this.queueService.removeUserFromQueue(userId, queueName);
  }
}
