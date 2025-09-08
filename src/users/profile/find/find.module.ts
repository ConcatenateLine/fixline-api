import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindService } from 'src/users/profile/find/find.service';
import { FindResolver } from 'src/users/profile/find/find.resolver';

@Module({
  providers: [PrismaService, FindService, FindResolver],
})
export class FindModule {}
