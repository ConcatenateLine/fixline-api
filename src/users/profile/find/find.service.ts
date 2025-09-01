import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindInput } from './find.input';
import { FindResponse } from './find.response';

@Injectable()
export class FindService {
  constructor(private prisma: PrismaService) {}

  async findProfile(input: FindInput): Promise<FindResponse | null> {
    return this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });
  }
}
