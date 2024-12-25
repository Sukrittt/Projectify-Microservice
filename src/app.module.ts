import { ConfigModule } from '@nestjs/config';
import { Module, MiddlewareConsumer } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { HashMiddleware } from 'src/middleware/hash.middleware';

import { UserModule } from 'src/user/user.module';

import { RoomModule } from 'src/room/room.module';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';
import { QueueModule } from 'src/queue/queue.module';
import { QueueService } from 'src/queue/queue.service';
import { UserController } from 'src/user/user.controller';
import { RoomController } from 'src/room/room.controller';
import { QueueController } from 'src/queue/queue.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    PrismaModule,
    RoomModule,
    QueueModule,
  ],
  controllers: [UserController, RoomController, QueueController],
  providers: [UserService, RoomService, QueueService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HashMiddleware).forRoutes('*');
  }
}
