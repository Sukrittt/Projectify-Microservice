import { Module, MiddlewareConsumer } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserController } from './user/user.controller';
import { HashMiddleware } from './middleware/hash.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    PrismaModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HashMiddleware).forRoutes('*');
  }
}
