/**
 * ! Executing this script will delete all data in your database and seed it with demo data.
 * Use any TypeScript runner to run this script, for example: `pnpm prisma:seed`
 * Learn more about the Seed Client: https://docs.snaplet.dev/seed/getting-started
 */
import { PrismaClient } from '@prisma/client';
import { plansAndPricesSeed } from './seeders/plansAndPrices.seed';
import { createSeedClient } from '@snaplet/seed';
import { authSeed } from './seeders/auth.seed';
import { tenantsAndMembershipsSeed } from './seeders/tenantsAndMemberships.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    const seed = await createSeedClient();

    console.log('🗑️ Resetting database...');
    await seed.$resetDatabase();

    await prisma.$transaction(async (tx: PrismaClient) => {
      await plansAndPricesSeed(tx);
    });

    if (process.env.SEED_DEMO === 'TRUE') {
      await authSeed(prisma, seed);
      await tenantsAndMembershipsSeed(prisma, seed);
    }

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
