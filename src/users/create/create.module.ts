import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResolver } from 'src/users/create/create.resolver';
import { CreateService } from 'src/users/create/create.service';

@Module({
    providers: [PrismaService, CreateResolver, CreateService],
})
export class CreateModule { }
