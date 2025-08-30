import { Module } from '@nestjs/common';
import { SignInModule } from './signIn/signIn.module';

@Module({
  imports: [SignInModule],
})
export class AuthModule { }
