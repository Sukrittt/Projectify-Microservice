import { Module } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClerkController, UserController } from 'src/user/user.controller';

@Module({
  controllers: [UserController, ClerkController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
