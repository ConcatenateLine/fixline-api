import { Module } from '@nestjs/common';
import { RegisterService } from 'src/account/register/register.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
