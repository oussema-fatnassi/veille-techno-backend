/**
 * Creates Prisma-backed list fixtures for owner and non-owner e2e scenarios.
 */

import { List, Prisma } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';

export async function createListFixture(
  prisma: PrismaService,
  data: Partial<Prisma.ListUncheckedCreateInput> & { ownerId: number },
): Promise<List> {
  return prisma.list.create({
    data: {
      title: data.title ?? 'Fixture List',
      position: data.position ?? 0,
      ownerId: data.ownerId,
    },
  });
}

export async function createOwnedListFixtures(
  prisma: PrismaService,
  ownerId: number,
  otherUserId: number,
) {
  const ownerList = await createListFixture(prisma, {
    ownerId,
    title: 'Owner Todo',
    position: 0,
  });

  const otherUserList = await createListFixture(prisma, {
    ownerId: otherUserId,
    title: 'Other Todo',
    position: 0,
  });

  return { ownerList, otherUserList };
}
