import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CardsService } from './cards.service';

jest.mock('@nestjs/common', () => {
  class ForbiddenException extends Error {}
  class NotFoundException extends Error {}

  return {
    ForbiddenException,
    Injectable: () => () => undefined,
    NotFoundException,
  };
});

type PrismaServiceMock = {
  card: {
    count: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  list: {
    findUnique: jest.Mock;
  };
};

const prismaServiceMockFactory = (): PrismaServiceMock => ({
  card: {
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  list: {
    findUnique: jest.fn(),
  },
});

const listFixture = {
  id: 1,
  title: 'Todo',
  position: 0,
  ownerId: 1,
  createdAt: new Date('2026-09-27T08:00:00.000Z'),
  updatedAt: new Date('2026-09-27T08:00:00.000Z'),
};

const cardFixture = {
  id: 1,
  title: 'Task',
  description: 'Task description',
  position: 0,
  listId: 1,
  createdAt: new Date('2026-09-27T08:00:00.000Z'),
  updatedAt: new Date('2026-09-27T08:00:00.000Z'),
};

const cardWithListFixture = {
  ...cardFixture,
  list: listFixture,
};

describe('CardsService', () => {
  let service: CardsService;
  let prismaServiceMock: PrismaServiceMock;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaServiceMock = prismaServiceMockFactory();
    service = new CardsService(prismaServiceMock as unknown as PrismaService);
  });

  it('finds cards for an owned list ordered by position', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue(listFixture);
    prismaServiceMock.card.findMany.mockResolvedValue([cardFixture]);

    const result = await service.findAllForList(1, listFixture.id);

    expect(prismaServiceMock.card.findMany).toHaveBeenCalledWith({
      where: {
        listId: listFixture.id,
      },
      orderBy: {
        position: 'asc',
      },
    });
    expect(result).toEqual([cardFixture]);
  });

  it('throws 403 when listing cards from another user list', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue({
      ...listFixture,
      ownerId: 2,
    });

    await expect(
      service.findAllForList(1, listFixture.id),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaServiceMock.card.findMany).not.toHaveBeenCalled();
  });

  it('throws 404 when listing cards from a missing list', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue(null);

    await expect(service.findAllForList(1, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a card in an owned list with the next automatic position', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue(listFixture);
    prismaServiceMock.card.count.mockResolvedValue(2);
    prismaServiceMock.card.create.mockResolvedValue({
      ...cardFixture,
      title: 'New Card',
      description: 'New description',
      position: 2,
    });

    const result = await service.createForList(1, listFixture.id, {
      title: ' New Card ',
      description: ' New description ',
    });

    expect(prismaServiceMock.card.create).toHaveBeenCalledWith({
      data: {
        title: 'New Card',
        description: 'New description',
        position: 2,
        listId: listFixture.id,
      },
    });
    expect(result).toMatchObject({
      title: 'New Card',
      description: 'New description',
      position: 2,
    });
  });

  it('gets an owned card without returning the included list', async () => {
    prismaServiceMock.card.findUnique.mockResolvedValue(cardWithListFixture);

    const result = await service.getCard(1, cardFixture.id);

    expect(prismaServiceMock.card.findUnique).toHaveBeenCalledWith({
      where: { id: cardFixture.id },
      include: {
        list: true,
      },
    });
    expect(result).toEqual(cardFixture);
    expect(result).not.toHaveProperty('list');
  });

  it('throws 404 when getting a missing card', async () => {
    prismaServiceMock.card.findUnique.mockResolvedValue(null);

    await expect(service.getCard(1, 999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates an owned card', async () => {
    prismaServiceMock.card.findUnique.mockResolvedValue(cardWithListFixture);
    prismaServiceMock.card.update.mockResolvedValue({
      ...cardFixture,
      title: 'Updated Card',
      position: 3,
    });

    const result = await service.updateCard(1, cardFixture.id, {
      title: ' Updated Card ',
      position: 3,
    });

    expect(prismaServiceMock.card.update).toHaveBeenCalledWith({
      where: { id: cardFixture.id },
      data: {
        title: 'Updated Card',
        position: 3,
      },
    });
    expect(result).toMatchObject({ title: 'Updated Card', position: 3 });
  });

  it('moves a card only to another owned list', async () => {
    const targetList = {
      ...listFixture,
      id: 2,
    };

    prismaServiceMock.card.findUnique.mockResolvedValue(cardWithListFixture);
    prismaServiceMock.list.findUnique.mockResolvedValue(targetList);
    prismaServiceMock.card.update.mockResolvedValue({
      ...cardFixture,
      listId: targetList.id,
    });

    await service.updateCard(1, cardFixture.id, {
      listId: targetList.id,
    });

    expect(prismaServiceMock.list.findUnique).toHaveBeenCalledWith({
      where: { id: targetList.id },
    });
    expect(prismaServiceMock.card.update).toHaveBeenCalledWith({
      where: { id: cardFixture.id },
      data: {
        listId: targetList.id,
      },
    });
  });

  it('throws 403 when moving a card to another user list', async () => {
    prismaServiceMock.card.findUnique.mockResolvedValue(cardWithListFixture);
    prismaServiceMock.list.findUnique.mockResolvedValue({
      ...listFixture,
      id: 2,
      ownerId: 2,
    });

    await expect(
      service.updateCard(1, cardFixture.id, { listId: 2 }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaServiceMock.card.update).not.toHaveBeenCalled();
  });

  it('deletes an owned card', async () => {
    prismaServiceMock.card.findUnique.mockResolvedValue(cardWithListFixture);
    prismaServiceMock.card.delete.mockResolvedValue(cardFixture);

    await service.deleteCard(1, cardFixture.id);

    expect(prismaServiceMock.card.delete).toHaveBeenCalledWith({
      where: { id: cardFixture.id },
    });
  });

  it('throws 403 when deleting another user card', async () => {
    prismaServiceMock.card.findUnique.mockResolvedValue({
      ...cardWithListFixture,
      list: {
        ...listFixture,
        ownerId: 2,
      },
    });

    await expect(service.deleteCard(1, cardFixture.id)).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(prismaServiceMock.card.delete).not.toHaveBeenCalled();
  });
});
