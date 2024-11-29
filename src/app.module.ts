import { Module, MiddlewareConsumer } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { HashMiddleware } from './middleware/hash.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HashMiddleware).forRoutes('*');
  }
}
