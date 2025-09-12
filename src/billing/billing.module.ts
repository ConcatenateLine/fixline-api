import { Module } from '@nestjs/common';
import { StripeModule } from './stripe/stripe.module';
import { RegisterModule } from 'src/account/register/register.module';

@Module({
  imports: [StripeModule, RegisterModule],
})
export class BillingModule {}
