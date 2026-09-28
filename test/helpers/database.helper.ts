import { PrismaService } from '../../src/prisma/prisma.service';

function assertTestDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl?.includes('veille_kanban_test')) {
    throw new Error(
      'Refusing to reset database: DATABASE_URL must point to veille_kanban_test.',
    );
  }
}

export async function resetDatabase(prisma: PrismaService) {
  assertTestDatabase();

  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();
}
