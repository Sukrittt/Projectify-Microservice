import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @ApiProperty({
    description: 'The clerk id of the user.',
    example: 'user_29w83sxmDNGwOuEthce5gg56FcC',
  })
  clerkId: string;
}
