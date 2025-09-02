import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModel } from '../models/user.model';
import { CreateUserInput } from './create.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateService {
  private saltRounds = 12;
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserInput): Promise<UserModel | null> {
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });
  }
}
