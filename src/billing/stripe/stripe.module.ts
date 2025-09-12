import { Module } from '@nestjs/common';
import { StripeController } from 'src/billing/stripe/stripe.controller';
import { StripeService } from 'src/billing/stripe/stripe.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterModule as RegisterAccountModule } from 'src/account/register/register.module';
import { RegisterModule as RegisterSubscriptionModule } from 'src/subscriptions/register/register.module';

@Module({
  imports: [ConfigModule, RegisterAccountModule, RegisterSubscriptionModule],
  controllers: [StripeController],
  providers: [StripeService, PrismaService],
})
export class StripeModule {}
