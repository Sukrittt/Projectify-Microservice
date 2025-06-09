import { Module } from '@nestjs/common';
import { MatchMakingService } from './matchmaking.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenerateService } from 'src/generate/generate.service';

@Module({
  providers: [MatchMakingService, PrismaService, GenerateService, UserService],
})
export class MatchMakingModule {}
