import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModule } from './create/create.module';

@Module({
  imports: [CreateModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController]
})
export class UsersModule { }
