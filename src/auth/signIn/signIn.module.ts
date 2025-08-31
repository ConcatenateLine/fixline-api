import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInService } from './signIn.service';
import { SignInResolver } from './signIn.resolver';
import { ValidateModule } from '../validate/validate.module';
import { LocalStrategy } from '../strategies/local.strategy';
import { GqlLocalAuthGuard } from '../strategies/gqlLocalAuthGuard.strategy';

@Module({
  imports: [ValidateModule],
  providers: [PrismaService, SignInService, SignInResolver, LocalStrategy, GqlLocalAuthGuard],
})
export class SignInModule { }
