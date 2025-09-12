import { Injectable } from '@nestjs/common';
import { PaymentProcessor } from 'src/payment/interfaces/paymentProcessor.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeProcessor implements PaymentProcessor {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY', ''), {
      apiVersion: this.configService.get(
        'STRIPE_API_VERSION',
        '2025-08-27.basil',
      ),
    });
  }

  async createCheckoutSession(email: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          where: {
            provider: 'stripe',
            active: true,
          },
        },
      },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.prices[0].currency,
            product_data: {
              name: plan.key,
              description: `Allows up to ${plan.maxTenants} tenants`,
            },
            unit_amount: plan.prices[0].amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get('FRONTEND_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/pricing`,
      metadata: {
        email,
        planId,
      },
    });

    if (!session.url) {
      throw new Error('Checkout session URL not found');
    }

    return {
      url: session.url,
    };
  }
}
