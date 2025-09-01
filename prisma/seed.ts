import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password', 12);
    // Seed tenants
    const tenantAcme = await prisma.tenant.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corp',
            slug: 'acme-corp',
        },
    });

    const tenantGlobex = await prisma.tenant.upsert({
        where: { slug: 'globex-inc' },
        update: {},
        create: {
            name: 'Globex Inc',
            slug: 'globex-inc',
        },
    });

    // Seed users
    await prisma.user.upsert({
        where: { email: 'admin@acme.com' },
        update: {},
        create: {
            email: 'admin@acme.com',
            name: 'Alice Admin',
            password: passwordHash,
        },
    });

    await prisma.user.upsert({
        where: { email: 'agent@globex.com' },
        update: {},
        create: {
            email: 'agent@globex.com',
            name: 'Gary Agent',
            password: passwordHash,
        },
    });

    // Seed tenant memberships
    await prisma.tenantMembership.create({
        data: {
            tenantId: tenantAcme.id,
            userId: 1,
            role: Role.ADMIN,
        },
    });

    await prisma.tenantMembership.create({
        data: {
            tenantId: tenantGlobex.id,
            userId: 2,
            role: Role.AGENT,
        },
    });

    console.log('✅ Seed complete');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
