import { PrismaClient, Role } from '@prisma/client';
import { copycat } from '@snaplet/copycat';
import { SeedClient } from '@snaplet/seed';

// Configuration constants for better consistency
const SEED_CONFIG = {
  MIN_ADDITIONAL_MEMBERS: 1,
  MAX_ADDITIONAL_MEMBERS: 4,
} as const;

// Company types for more realistic tenant names
const COMPANY_TYPES = ['LLC', 'Inc', 'Corp', 'Ltd', 'Co'];

function getSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateRealisticCompanyName(seed: string): string {
  const baseName = copycat.words(seed, { min: 1, max: 2 });
  const companyType = copycat.oneOf(seed + '_type', COMPANY_TYPES);
  return `${baseName} ${companyType}`;
}

function calculateSeatUsed(memberCount: number, seatLimit: number): number {
  return Math.min(memberCount, seatLimit);
}

async function createTenantsWithMemberships(
  prisma: PrismaClient,
  accounts: any[],
  users: any[],
) {
  console.log('🏬 Creating tenants and memberships...');

  for (const account of accounts) {
    if (!account.user) continue;

    // Generate consistent company name based on user email
    const companyName = generateRealisticCompanyName(account.userEmail);
    const tenantSlug = getSlug(companyName);

    // Dynamic seat limits based on company size
    const seatLimit = copycat.int(account.userEmail + '_seats', {
      min: 3,
      max: 20,
    });

    // Determine number of additional members (excluding owner)
    const additionalMemberCount = copycat.int(account.userEmail + '_members', {
      min: SEED_CONFIG.MIN_ADDITIONAL_MEMBERS,
      max: Math.min(SEED_CONFIG.MAX_ADDITIONAL_MEMBERS, users.length - 1),
    });

    const totalMembers = 1 + additionalMemberCount; // +1 for owner
    const seatUsed = calculateSeatUsed(totalMembers, seatLimit);

    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantSlug },
      update: {},
      create: {
        name: companyName,
        slug: tenantSlug,
        contactEmail: account.userEmail,
        accountId: account.id,
        seatLimit,
        seatUsed,
      },
    });

    // Add owner membership
    await prisma.tenantMembership.upsert({
      where: {
        tenantId_userId: { tenantId: tenant.id, userId: account.user.id },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: account.user.id,
        role: Role.OWNER,
      },
    });

    // Add additional members with hierarchical role distribution
    if (additionalMemberCount > 0) {
      const otherUsers = users.filter((u) => u.id !== account.user.id);

      // Use copycat for consistent member selection
      const selectedMembers = copycat.someOf(
        account.userEmail + '_team',
        additionalMemberCount,
        otherUsers,
      );

      for (let i = 0; i < selectedMembers.length; i++) {
        const member = selectedMembers[i];

        // Assign roles based on position and company size
        let role: Role;
        if (seatLimit >= 10 && i === 0) {
          role = Role.ADMIN; // First member in larger companies gets admin
        } else if (i < selectedMembers.length / 3) {
          role = copycat.oneOf(member.email + tenant.id, [
            Role.MANAGER,
            Role.ADMIN,
          ]);
        } else if (i < (selectedMembers.length * 2) / 3) {
          role = copycat.oneOf(member.email + tenant.id + '_mid', [
            Role.AGENT,
            Role.MANAGER,
          ]);
        } else {
          role = copycat.oneOf(member.email + tenant.id + '_low', [
            Role.REPORTER,
            Role.GUEST,
          ]);
        }

        await prisma.tenantMembership.upsert({
          where: {
            tenantId_userId: { tenantId: tenant.id, userId: member.id },
          },
          update: {},
          create: {
            tenantId: tenant.id,
            userId: member.id,
            role,
          },
        });
      }
    }

    // Update account tenant usage
    await prisma.account.update({
      where: { id: account.id },
      data: { tenantsUsed: 1 },
    });

    console.log(
      `  ✔️  Created tenant "${companyName}" with ${totalMembers} members`,
    );
  }
}

export async function tenantsAndMembershipsSeed(
  prisma: PrismaClient,
  seed: SeedClient,
) {
  console.log('\n🌱 Starting database tenants and memberships seeding...');

  try {
    const users = await prisma.user.findMany();

    // 1. Create tenants with memberships
    const accounts = await prisma.account.findMany({ include: { user: true } });
    await createTenantsWithMemberships(prisma, accounts, users);

    const stats = {
      tenants: await prisma.tenant.count(),
      memberships: await prisma.tenantMembership.count(),
    };

    console.log('📊 Seeding Tenants and Memberships Summary:');
    console.log(`   🏬 Tenants: ${stats.tenants}`);
    console.log(`   👨‍💼 Memberships: ${stats.memberships}`);

    console.log('\n✅ Database seeded tenants and memberships successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}
