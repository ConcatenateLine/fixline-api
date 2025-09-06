import { PrismaClient } from '@prisma/client';
import { createSeedClient } from '@snaplet/seed';
import { SEEDERS } from './seeders';

const prisma = new PrismaClient();

const RESET = process.env.SEED_RESET === 'TRUE';
const MODE_ENV = process.env.SEED_MODE || 'ALL';
const MODE = (MODE_ENV as 'BASE' | 'DEMO' | 'ALL');
const ONLY = (process.env.SEED_ONLY || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function shouldRun(mode: 'BASE' | 'DEMO' | 'ALL') {
  if (MODE === 'ALL') return true;
  return MODE === mode;
}

async function run() {
  console.log('🌱 Seed start', { RESET, MODE, ONLY: ONLY.join(',') || '(ALL)' });
  const snaplet = await createSeedClient();

  if (RESET) {
    console.log('🗑️ Resetting database...');
    await snaplet.$resetDatabase();
  }

  const selected = SEEDERS
    .filter((s) => (ONLY.length ? ONLY.includes(s.name) : true))
    .filter((s) => shouldRun(s.mode));

  const resolved = new Set<string>();
  async function runSeeder(name: string) {
    const seeder = selected.find((s) => s.name === name);
    if (!seeder || resolved.has(name)) return;
    for (const dep of seeder.dependsOn || []) {
      await runSeeder(dep);
    }
    console.log(`\n➡️  Running ${seeder.name} (${seeder.mode})`);
    if (seeder.mode === 'BASE') {
      await prisma.$transaction(async (tx: PrismaClient) => {
        await seeder.run({ prisma: tx });
      });
    } else {
      await seeder.run({ prisma, snaplet });
    }
    resolved.add(name);
    console.log(`✅ Done ${seeder.name} \n`);
  }

  for (const s of selected) {
    await runSeeder(s.name);
  }

  // Minimal post-assertions for base data
  if (MODE === 'BASE' || MODE === 'ALL') {
    console.log('🔎 Validating base data...');
    const planCount = await prisma.plan.count();
    if (planCount === 0) throw new Error('No plans found after seeding');
  }

  console.log('🎉 Seeding completed');
}

run()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
