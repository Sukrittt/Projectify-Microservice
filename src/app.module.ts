import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { Module, MiddlewareConsumer } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { HashMiddleware } from 'src/middleware/hash.middleware';

import { UserModule } from 'src/user/user.module';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { RoomModule } from 'src/room/room.module';
import { GenerateModule } from './generate/generate.module';
import { MatchMakingModule } from './matchmaking/matchmaking.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    PrismaModule,
    RoomModule,
    GenerateModule,
    ScheduleModule.forRoot(),
    MatchMakingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HashMiddleware).forRoutes('*');
  }
}
