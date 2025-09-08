import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindModule } from 'src/users/profile/find/find.module';

@Module({
  imports: [FindModule],
  providers: [PrismaService],
})
export class ProfileModule {}
