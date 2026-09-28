/**
 * Creates Prisma-backed card fixtures whose ownership follows their parent lists.
 */

import { Card, Prisma } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';

export async function createCardFixture(
  prisma: PrismaService,
  data: Partial<Prisma.CardUncheckedCreateInput> & { listId: number },
): Promise<Card> {
  return prisma.card.create({
    data: {
      title: data.title ?? 'Fixture Card',
      description: data.description ?? 'Fixture card description',
      position: data.position ?? 0,
      listId: data.listId,
    },
  });
}

export async function createOwnedCardFixtures(
  prisma: PrismaService,
  ownerListId: number,
  otherUserListId: number,
) {
  const ownerCard = await createCardFixture(prisma, {
    listId: ownerListId,
    title: 'Owner Card',
    position: 0,
  });

  const otherUserCard = await createCardFixture(prisma, {
    listId: otherUserListId,
    title: 'Other Card',
    position: 0,
  });

  return { ownerCard, otherUserCard };
}
