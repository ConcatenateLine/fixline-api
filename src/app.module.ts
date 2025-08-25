import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GrapqlModule } from './grapql/grapql.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [GrapqlModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
