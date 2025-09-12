import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class RegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async registerAccount(session: Stripe.Checkout.Session) {
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

    const account = await this.prisma.account.upsert({
      where: {
        userEmail: metadata.email,
      },
      create: {
        user: { connect: { email: metadata.email } },
        maxTenants: plan.maxTenants,
        tenantsUsed: 0,
      },
      update: {
        maxTenants: plan.maxTenants,
      },
    });

    return account;
  }
}
