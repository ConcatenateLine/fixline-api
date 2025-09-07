import { PrismaService } from 'src/prisma/prisma.service';

export async function CleanUpExistingTestData(prisma: PrismaService) {
  try {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: '@example.com' } },
          { email: { contains: '@e2etest.com' } },
        ],
      },
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

export async function CleanUpTestData(prisma: PrismaService) {
  try {
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: '@example.com' } },
          { email: { contains: '@e2etest.com' } },
          { email: { contains: '+tag@example.com' } },
          { email: { startsWith: 'longpass' } },
        ],
      },
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}
