import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModel } from '../models/user.models';
import { CreateUserInput } from './create.input';

@Injectable()
export class CreateService {
    constructor(private prisma: PrismaService) { }

    async createUser(data: CreateUserInput): Promise<UserModel> {
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name ? data.name : '',
            },
        });
    }
}
