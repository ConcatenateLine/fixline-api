import { Inject, Injectable } from '@nestjs/common';
import { PaymentProcessor } from 'src/payment/interfaces/paymentProcessor.interface';

@Injectable()
export class CheckOutService {
  constructor(
    @Inject('PAYMENT_PROCESSORS')
    private readonly paymentProcessors: Map<string, PaymentProcessor>,
  ) {}

  private getProcessor(processorType: string): PaymentProcessor {
    const processor = this.paymentProcessors.get(processorType);
    if (!processor) {
      throw new Error(`Unsupported payment processor: ${processorType}`);
    }
    return processor;
  }

  async createCheckoutSession(
    email: string,
    planId: string,
    processorType: string = 'stripe',
  ) {
    const processor = this.getProcessor(processorType);
    return processor.createCheckoutSession(email, planId);
  }
}
