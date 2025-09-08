import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindInput } from 'src/users/profile/find/find.input';
import { FindResponse } from 'src/users/profile/find/find.response';

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
