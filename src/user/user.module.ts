import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClerkController, UserController } from './user.controller';

@Module({
  controllers: [UserController, ClerkController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
