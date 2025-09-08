import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindService } from 'src/users/find/find.service';

@Module({
  providers: [PrismaService, FindService],
  exports: [FindService],
})
export class FindModule { }
