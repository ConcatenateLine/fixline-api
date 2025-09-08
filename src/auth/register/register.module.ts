import { Module } from '@nestjs/common';
import { RegisterService } from 'src/auth/register/register.service';
import { RegisterResolver } from 'src/auth/register/register.resolver';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, RegisterService, RegisterResolver],
})
export class RegisterModule {}
