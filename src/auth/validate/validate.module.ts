import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindModule } from 'src/users/find/find.module';
import { ValidateService } from './validate.service';

@Module({
  imports: [FindModule],
  providers: [PrismaService, ValidateService],
  exports: [ValidateService],
})
export class ValidateModule { }
