import { PrismaClient, BillingInterval } from '@prisma/client';

async function createPlansAndPrices(tx: PrismaClient) {
  await tx.plan.upsert({
    where: {
      id: 'basic',
    },
    update: {},
    create: {
      id: 'basic',
      key: 'basic',
      name: 'Basic',
      maxTenants: 1,
      prices: {
        create: {
          id: 'basic_monthly',
          provider: 'stripe',
          productId: 'product_1N5X5ZK0K0K0K0K0K0K0K0K0',
          priceId: 'price_1N5X5ZK0K0K0K0K0K0K0K0K0',
          interval: BillingInterval.MONTH,
          amountCents: 0,
          currency: 'USD',
        },
      },
    },
  });

  await tx.plan.upsert({
    where: {
      id: 'pro',
    },
    update: {},
    create: {
      id: 'pro',
      key: 'pro',
      name: 'Pro',
      maxTenants: 5,
      prices: {
        create: {
          id: 'pro_monthly',
          provider: 'stripe',
          productId: 'product_2N5X5ZK0K0K0K0K0K0K0K0K0',
          priceId: 'price_2N5X5ZK0K0K0K0K0K0K0K0K0',
          interval: BillingInterval.MONTH,
          amountCents: 0,
          currency: 'USD',
        },
      },
    },
  });

  await tx.plan.upsert({
    where: {
      id: 'enterprise',
    },
    update: {},
    create: {
      id: 'enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      maxTenants: 10,
      prices: {
        create: {
          id: 'enterprise_monthly',
          provider: 'stripe',
          productId: 'product_3N5X5ZK0K0K0K0K0K0K0K0K0',
          priceId: 'price_3N5X5ZK0K0K0K0K0K0K0K0K0',
          interval: BillingInterval.MONTH,
          amountCents: 0,
          currency: 'USD',
        },
      },
    },
  });
}

export async function plansAndPricesSeed(prisma: PrismaClient) {
  console.log('\n🌱 Starting database plans and prices seeding...');

  try {
    await createPlansAndPrices(prisma);

    const stats = {
      plans: await prisma.plan.count(),
      prices: await prisma.planPrice.count(),
    };

    console.log('📊 Seeding Plans and Prices Summary:');
    console.log(`   🏬 Plans: ${stats.plans}`);
    console.log(`   👨‍💼 Prices: ${stats.prices}`);

    console.log('\n✅ Database seeded plans and prices successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}
