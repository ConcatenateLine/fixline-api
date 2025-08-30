import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindService } from './find.service';

@Module({
  providers: [PrismaService, FindService],
  exports: [FindService],
})
export class FindModule { }
