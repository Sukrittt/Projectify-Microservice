import { Module } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { GenerateService } from 'src/generate/generate.service';
import { GenerateController } from 'src/generate/generate.controller';

@Module({
  controllers: [GenerateController],
  providers: [GenerateService, PrismaService, UserService],
})
export class GenerateModule {}
