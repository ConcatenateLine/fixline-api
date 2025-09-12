import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersController } from 'src/users/users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModule } from 'src/users/create/create.module';
import { FindModule } from 'src/users/find/find.module';
import { ProfileModule } from 'src/users/profile/profile.module';
import { CheckOutModule } from 'src/users/checkOut/checkOut.module';

@Module({
  imports: [CreateModule, FindModule, ProfileModule, CheckOutModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
