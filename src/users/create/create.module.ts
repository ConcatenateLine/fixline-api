import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResolver } from './create.resolver';
import { CreateService } from './create.service';

@Module({
    providers: [PrismaService, CreateResolver, CreateService],
})
export class CreateModule { }
