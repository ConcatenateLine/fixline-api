import { Module } from '@nestjs/common';
import { RegisterModule } from 'src/account/register/register.module';

@Module({
  imports: [RegisterModule],
})
export class AccountModule {}
