export type SeedContext = {
  prisma: import('@prisma/client').PrismaClient;
  snaplet?: import('@snaplet/seed').SeedClient;
};

export type SeedMeta = {
  name: string;
  mode: 'BASE' | 'DEMO';
  run: (ctx: SeedContext) => Promise<void>;
  dependsOn?: string[];
};

import { plansAndPricesSeed } from './plansAndPrices.seed';
import { authSeed } from './auth.seed';
import { tenantsAndMembershipsSeed } from './tenantsAndMemberships.seed';

export const SEEDERS: SeedMeta[] = [
  {
    name: 'plansAndPrices',
    mode: 'BASE',
    run: async ({ prisma }) => plansAndPricesSeed(prisma),
  },
  {
    name: 'auth',
    mode: 'DEMO',
    dependsOn: ['plansAndPrices'],
    run: async ({ prisma, snaplet }) => authSeed(prisma, snaplet!),
  },
  {
    name: 'tenantsAndMemberships',
    mode: 'DEMO',
    dependsOn: ['auth'],
    run: async ({ prisma, snaplet }) => tenantsAndMembershipsSeed(prisma, snaplet!),
  },
];

