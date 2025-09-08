import { Module } from '@nestjs/common';
import { SignInModule } from 'src/auth/signIn/signIn.module';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RegisterModule } from 'src/auth/register/register.module';

@Module({
  imports: [SignInModule, RegisterModule],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
