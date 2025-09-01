import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindService } from './find.service';
import { FindResolver } from './find.resolver';

@Module({
  providers: [PrismaService, FindService, FindResolver],
})
export class FindModule {}
