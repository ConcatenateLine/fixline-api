import { Module } from '@nestjs/common';
import { SignInModule } from './signIn/signIn.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { RegisterModule } from './register/register.module';

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
