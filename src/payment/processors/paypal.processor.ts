import { Injectable } from '@nestjs/common';
import { PaymentProcessor } from 'src/payment/interfaces/paymentProcessor.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaypalProcessor implements PaymentProcessor {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  createCheckoutSession(
    userId: string,
    planId: string,
  ): Promise<{ url: string }> {
    // TODO: Implement PayPal checkout session creation
    throw new Error('Method not implemented.');
  }

  handleWebhook(
    signature: string,
    payload: Buffer,
  ): Promise<{ received: boolean }> {
    // TODO: Implement PayPal webhook handling
    throw new Error('Method not implemented.');
  }
}
