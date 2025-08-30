import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInService } from './signIn.service';
import { SignInResolver } from './signIn.resolver';
import { ValidateModule } from '../validate/validate.module';
import { LocalStrategy } from '../strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [ValidateModule, PassportModule],
  providers: [PrismaService, SignInService, SignInResolver, LocalStrategy],
})
export class SignInModule { }
