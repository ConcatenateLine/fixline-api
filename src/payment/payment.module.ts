import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentProcessor } from 'src/payment/interfaces/paymentProcessor.interface';
import { StripeProcessor } from 'src/payment/processors/stripe.processor';
import { PaypalProcessor } from 'src/payment/processors/paypal.processor';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterService } from 'src/account/register/register.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: 'PAYMENT_PROCESSORS',
      useFactory: (configService: ConfigService, prismaService: PrismaService) => {
        const processors = new Map<string, PaymentProcessor>();
        processors.set('stripe', new StripeProcessor(configService, prismaService));
        processors.set('paypal', new PaypalProcessor(configService, prismaService));
        return processors;
      },
      inject: [ConfigService, PrismaService],
    },
    RegisterService,
  ],
  exports: ['PAYMENT_PROCESSORS'],
})
export class PaymentModule {}
