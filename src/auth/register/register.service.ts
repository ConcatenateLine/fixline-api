import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterInput } from './register.input';

@Injectable()
export class RegisterService {
  private readonly saltRounds = 12;
  constructor(private prisma: PrismaService) {}

  async register(input: RegisterInput) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
