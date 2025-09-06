import { PrismaClient, SubscriptionStatus } from '@prisma/client';
import { copycat } from '@snaplet/copycat';
import { SeedClient } from '@snaplet/seed';
import * as bcrypt from 'bcrypt';

// Configuration constants for better consistency
const SEED_CONFIG = {
  USER_COUNT: 12,
  SUBSCRIPTION_DURATION_DAYS: 30,
} as const;

function generateUniqueId(prefix: string, identifier: string): string {
  const hash = copycat.scramble(identifier);
  return `${prefix}_${hash.slice(0, 16)}`;
}

// Helper to generate a random date within a range
function randomDate(seed: string, daysAgo: number): Date {
  const days = copycat.int(seed, { min: 1, max: daysAgo });
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function createUsers(seed: SeedClient, count: number) {
  console.log(`📝 Creating ${count} users...`);
  const password = bcrypt.hashSync(process.env.DEMO_PASSWORD || 'password', 12);

  await seed.User((x: any) =>
    x(count, ({ seed: userSeed }: { seed: string }) => {
      const firstName = copycat.firstName(userSeed);
      const lastName = copycat.lastName(userSeed + '_last');
      const fullName = `${firstName} ${lastName}`;

      return {
        email: copycat.email(userSeed, {
          domain: 'acme.org',
        }),
        name: fullName,
        password,
      };
    }),
  );
}

async function createAccountsForUsers(prisma: PrismaClient, users: any[]) {
  console.log('🏢 Creating accounts for users...');

  for (const user of users) {
    await prisma.account.upsert({
      where: { userEmail: user.email },
      update: {},
      create: {
        userEmail: user.email,
        maxTenants: copycat.int(user.email, { min: 1, max: 3 }), // More realistic tenant limits
        tenantsUsed: 0, // Will be updated when tenants are created
      },
    });
  }
}

async function createSubscriptions(prisma: PrismaClient, accounts: any[]) {
  console.log('💳 Creating subscriptions and billing events...');

  const basicPlan = await prisma.plan.findUnique({ where: { key: 'basic' } });

  if (!basicPlan) {
    console.warn('⚠️ Basic plan not found, skipping subscription creation');
    return;
  }

  const basicPrice = await prisma.planPrice.findFirst({
    where: { planId: basicPlan.id, active: true },
  });

  if (!basicPrice) {
    console.warn('⚠️ Basic price not found, skipping subscription creation');
    return;
  }

  for (const account of accounts) {
    const subscriptionId = generateUniqueId('sub', account.userEmail);
    const customerId = generateUniqueId('cus', account.userEmail);

    // Vary subscription start dates for realism
    const startDate = randomDate(account.userEmail, 60);
    const endDate = new Date(
      startDate.getTime() +
        SEED_CONFIG.SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );

    // Determine subscription status based on dates
    const now = new Date();
    let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
    if (endDate < now) {
      status = copycat.oneOf(account.userEmail + '_status', [
        SubscriptionStatus.PAST_DUE,
        SubscriptionStatus.CANCELED,
      ] as const);
    }

    await prisma.subscription.upsert({
      where: { subscriptionId },
      update: {},
      create: {
        provider: 'stripe',
        customerId,
        subscriptionId,
        priceId: basicPrice.priceId,
        status,
        periodStart: startDate,
        periodEnd: endDate,
        accountId: account.id,
        planId: basicPlan.id,
      },
    });

    const subscription = await prisma.subscription.findUniqueOrThrow({
      where: { subscriptionId },
    });

    // Create billing event
    const eventId = generateUniqueId('evt', account.userEmail);
    await prisma.billingEvent.upsert({
      where: { provider_eventId: { provider: 'stripe', eventId } },
      update: {},
      create: {
        provider: 'stripe',
        eventId,
        type: 'subscription.created',
        raw: {
          subscription: subscriptionId,
          customer: customerId,
          plan: basicPlan.key,
          amount: basicPrice.amountCents,
          currency: basicPrice.currency,
          created: Math.floor(startDate.getTime() / 1000),
        },
        accountId: account.id,
        subscriptionId: subscription.id,
      },
    });

    console.log(
      `  ✔️  Created subscription for ${account.userEmail} (${status})`,
    );
  }
}

export async function authSeed(prisma: PrismaClient, seed: SeedClient) {
  try {
    // 1. Create users
    await createUsers(seed, SEED_CONFIG.USER_COUNT);

    // 2. Get created users and create accounts
    const users = await prisma.user.findMany();
    await createAccountsForUsers(prisma, users);

    // 3. Create tenants with memberships
    const accounts = await prisma.account.findMany({ include: { user: true } });

    // 4. Create subscriptions
    await createSubscriptions(prisma, accounts);

    const stats = {
      users: await prisma.user.count(),
      accounts: await prisma.account.count(),
      subscriptions: await prisma.subscription.count(),
    };

    console.log('📊 Seeding Summary:');
    console.log(`   👥 Users: ${stats.users}`);
    console.log(`   🏢 Accounts: ${stats.accounts}`);
    console.log(`   💳 Subscriptions: ${stats.subscriptions}`);

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}
