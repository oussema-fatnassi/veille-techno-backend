import * as bcrypt from 'bcrypt';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';

export const TEST_PASSWORD = 'Password1!';

export async function createUserFixture(
  prisma: PrismaService,
  data: Partial<Prisma.UserCreateInput> = {},
): Promise<User> {
  const email = data.email ?? `user-${Date.now()}@example.com`;
  const password = data.password ?? (await bcrypt.hash(TEST_PASSWORD, 10));
  const name = data.name ?? 'Fixture User';
  const role = data.role ?? Role.USER;

  return prisma.user.create({
    data: {
      email,
      password,
      name,
      role,
    },
  });
}

export async function createOwnerAndOtherUserFixtures(prisma: PrismaService) {
  const owner = await createUserFixture(prisma, {
    email: 'owner@example.com',
    name: 'Owner User',
  });

  const otherUser = await createUserFixture(prisma, {
    email: 'other@example.com',
    name: 'Other User',
  });

  return { owner, otherUser };
}
