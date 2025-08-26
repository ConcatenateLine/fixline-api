import path from 'node:path';
import type { PrismaConfig } from 'prisma';
import "dotenv/config";

export default {
    schema: path.join(__dirname, 'prisma'),
    migrations: {
        seed: 'ts-node prisma/seed.ts',
    }
} satisfies PrismaConfig;
