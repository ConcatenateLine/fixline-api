import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInService } from 'src/auth/signIn/signIn.service';
import { SignInResolver } from 'src/auth/signIn/signIn.resolver';
import { ValidateModule } from 'src/auth/validate/validate.module';
import { LocalStrategy } from 'src/auth/strategies/local.strategy';
import { GqlLocalAuthGuard } from 'src/auth/guards/gqlLocalAuth.guard';

@Module({
  imports: [ValidateModule],
  providers: [
    PrismaService,
    SignInService,
    SignInResolver,
    LocalStrategy,
    GqlLocalAuthGuard,
  ],
})
export class SignInModule {}
