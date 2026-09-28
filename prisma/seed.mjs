import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Test1234.';

const demoUsers = [
  {
    email: 'admin@test.com',
    name: 'Demo Admin',
    role: 'ADMIN',
    lists: [
      {
        title: 'Admin Backlog',
        position: 0,
        cards: [
          {
            title: 'Review all users',
            description: 'Admin can manage users and demonstrate role access.',
            position: 0,
          },
          {
            title: 'Prepare demo board',
            description: 'Use this card during the project demonstration.',
            position: 1,
          },
        ],
      },
      {
        title: 'Admin Done',
        position: 1,
        cards: [
          {
            title: 'Seed demo accounts',
            description: 'Admin, test user 1 and test user 2 are available.',
            position: 0,
          },
        ],
      },
    ],
  },
  {
    email: 'tesst1@test.com',
    name: 'Demo User One',
    role: 'USER',
    lists: [
      {
        title: 'User One Todo',
        position: 0,
        cards: [
          {
            title: 'Create first task',
            description: 'This card belongs to tesst1@test.com.',
            position: 0,
          },
          {
            title: 'Move card',
            description: 'Use this card to demonstrate card updates.',
            position: 1,
          },
        ],
      },
      {
        title: 'User One Done',
        position: 1,
        cards: [
          {
            title: 'Login works',
            description: 'Use this account to show regular user permissions.',
            position: 0,
          },
        ],
      },
    ],
  },
  {
    email: 'test2@test.com',
    name: 'Demo User Two',
    role: 'USER',
    lists: [
      {
        title: 'User Two Todo',
        position: 0,
        cards: [
          {
            title: 'Private user two card',
            description:
              'Use this card to demonstrate that another user gets 403.',
            position: 0,
          },
        ],
      },
      {
        title: 'User Two In Progress',
        position: 1,
        cards: [
          {
            title: 'Check ownership rules',
            description: 'This board belongs only to test2@test.com.',
            position: 0,
          },
        ],
      },
    ],
  },
];

function assertSafeSeedTarget() {
  const databaseUrl = process.env.DATABASE_URL;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed data when NODE_ENV=production.');
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the seed script.');
  }

  const databaseName = new URL(databaseUrl).pathname.replace('/', '');

  if (!databaseName.startsWith('veille_kanban')) {
    throw new Error(
      `Refusing to seed unexpected database "${databaseName}". Expected a veille_kanban database.`,
    );
  }
}

async function clearDatabase() {
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();
}

async function createDemoUser(user, hashedPassword) {
  return prisma.user.create({
    data: {
      email: user.email,
      name: user.name,
      role: user.role,
      password: hashedPassword,
      lists: {
        create: user.lists.map((list) => ({
          title: list.title,
          position: list.position,
          cards: {
            create: list.cards,
          },
        })),
      },
    },
    include: {
      lists: {
        include: {
          cards: true,
        },
      },
    },
  });
}

async function main() {
  assertSafeSeedTarget();

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  await clearDatabase();

  const createdUsers = [];

  for (const user of demoUsers) {
    const createdUser = await createDemoUser(user, hashedPassword);
    createdUsers.push(createdUser);
  }

  console.log('Demo database seeded successfully.');
  console.table(
    createdUsers.map((user) => ({
      email: user.email,
      password: DEMO_PASSWORD,
      role: user.role,
      lists: user.lists.length,
      cards: user.lists.reduce((total, list) => total + list.cards.length, 0),
    })),
  );
}

main()
  .catch((error) => {
    console.error('Demo seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
