import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { SubscriptionStatus } from 'src/subscriptions/enums/subscriptionStatus.enum';
import { AccountModel } from 'src/account/models/account.model';

@Injectable()
export class RegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async registerSubscription(
    session: Stripe.Checkout.Session,
    account: AccountModel,
  ) {
    const metadata = session.metadata;

    if (!metadata) {
      throw new Error('Metadata not found');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: metadata.planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    await this.prisma.subscription.upsert({
      where: {
        subscriptionId: session.id,
      },
      create: {
        account: { connect: { id: account.id } },
        plan: { connect: { id: plan.id } },
        provider: 'stripe',
        customerId: session.customer?.toString() || '',
        subscriptionId: session.id,
        priceId: session.amount_total?.toString() || '',
        status: this.convertStripeStatusToSubscriptionStatus(session.status),
        periodStart: new Date(),
        periodEnd: session.expires_at ? new Date(session.expires_at) : null,
      },
      update: {
        priceId: session.amount_total?.toString() || '',
        status: this.convertStripeStatusToSubscriptionStatus(session.status),
        periodEnd: session.expires_at ? new Date(session.expires_at) : null,
      },
    });
  }

  private convertStripeStatusToSubscriptionStatus(
    status: string | null,
  ): SubscriptionStatus {
    switch (status) {
      case 'open':
        return SubscriptionStatus.ACTIVE;
      case 'completed':
        return SubscriptionStatus.PAST_DUE;
      case 'expired':
        return SubscriptionStatus.CANCELED;
      default:
        throw new Error(`Unknown status: ${status}`);
    }
  }
}
