import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class GetCreateQueueDto {
  @IsString()
  @ApiProperty({
    description: 'The name of the queue.',
    example: 'matchmaking-queue',
  })
  queueName: string;
}
