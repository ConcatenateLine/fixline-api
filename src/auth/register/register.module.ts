import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterResolver } from './register.resolver';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, RegisterService, RegisterResolver],
})
export class RegisterModule {}
