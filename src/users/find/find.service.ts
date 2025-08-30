import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindByEmailInput } from './findByEmail.input';
import { UserModel } from '../models/user.model';

@Injectable()
export class FindService {
  constructor(private prisma: PrismaService) { }

  async findUserByEmail(data: FindByEmailInput): Promise<UserModel | null> {
    return this.prisma.user.findFirst({
      where: {
        email: data.email
      }
    })
  }
}
