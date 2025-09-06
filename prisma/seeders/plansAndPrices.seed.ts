import { PrismaClient, BillingInterval, Currency } from '@prisma/client';
import { PRODUCTS } from './seed.constants';

async function createPlansAndPrices(tx: PrismaClient) {
  // Upsert plans by unique key
  await tx.plan.upsert({
    where: { key: 'basic' },
    update: {},
    create: {
      key: 'basic',
      name: 'Basic',
      maxTenants: 1,
    },
  });

  await tx.plan.upsert({
    where: { key: 'pro' },
    update: {},
    create: {
      key: 'pro',
      name: 'Pro',
      maxTenants: 5,
    },
  });

  await tx.plan.upsert({
    where: { key: 'enterprise' },
    update: {},
    create: {
      key: 'enterprise',
      name: 'Enterprise',
      maxTenants: 10,
    },
  });

  // Upsert prices by unique priceId and connect to plans by key
  await tx.planPrice.upsert({
    where: { priceId: PRODUCTS.basic.stripe.priceId },
    update: {
      active: true,
      amountCents: 0,
      currency: Currency.USD,
      interval: BillingInterval.MONTH,
      provider: 'stripe',
      productId: PRODUCTS.basic.stripe.productId,
      plan: { connect: { key: 'basic' } },
    },
    create: {
      priceId: PRODUCTS.basic.stripe.priceId,
      provider: 'stripe',
      productId: PRODUCTS.basic.stripe.productId,
      interval: BillingInterval.MONTH,
      amountCents: 0,
      currency: Currency.USD,
      plan: { connect: { key: 'basic' } },
    },
  });

  await tx.planPrice.upsert({
    where: { priceId: PRODUCTS.pro.stripe.priceId },
    update: {
      active: true,
      amountCents: 0,
      currency: Currency.USD,
      interval: BillingInterval.MONTH,
      provider: 'stripe',
      productId: PRODUCTS.pro.stripe.productId,
      plan: { connect: { key: 'pro' } },
    },
    create: {
      priceId: PRODUCTS.pro.stripe.priceId,
      provider: 'stripe',
      productId: PRODUCTS.pro.stripe.productId,
      interval: BillingInterval.MONTH,
      amountCents: 0,
      currency: Currency.USD,
      plan: { connect: { key: 'pro' } },
    },
  });

  await tx.planPrice.upsert({
    where: { priceId: PRODUCTS.enterprise.stripe.priceId },
    update: {
      active: true,
      amountCents: 0,
      currency: Currency.USD,
      interval: BillingInterval.MONTH,
      provider: 'stripe',
      productId: PRODUCTS.enterprise.stripe.productId,
      plan: { connect: { key: 'enterprise' } },
    },
    create: {
      priceId: PRODUCTS.enterprise.stripe.priceId,
      provider: 'stripe',
      productId: PRODUCTS.enterprise.stripe.productId,
      interval: BillingInterval.MONTH,
      amountCents: 0,
      currency: Currency.USD,
      plan: { connect: { key: 'enterprise' } },
    },
  });
}

export async function plansAndPricesSeed(prisma: PrismaClient) {
  try {
    await createPlansAndPrices(prisma);

    const stats = {
      plans: await prisma.plan.count(),
      prices: await prisma.planPrice.count(),
    };

    console.log('📊 Seeding Plans and Prices Summary:');
    console.log(`   🏬 Plans: ${stats.plans}`);
    console.log(`   👨‍💼 Prices: ${stats.prices}`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}
