import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListsService } from './lists.service';

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
  list: {
    count: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

const prismaServiceMockFactory = (): PrismaServiceMock => ({
  list: {
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
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

describe('ListsService', () => {
  let service: ListsService;
  let prismaServiceMock: PrismaServiceMock;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaServiceMock = prismaServiceMockFactory();
    service = new ListsService(prismaServiceMock as unknown as PrismaService);
  });

  it('finds only the current user lists ordered by position', async () => {
    prismaServiceMock.list.findMany.mockResolvedValue([listFixture]);

    const result = await service.findAllForUser(1);

    expect(prismaServiceMock.list.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: 1,
      },
      orderBy: {
        position: 'asc',
      },
    });
    expect(result).toEqual([listFixture]);
  });

  it('creates a list with the next automatic position', async () => {
    prismaServiceMock.list.count.mockResolvedValue(2);
    prismaServiceMock.list.create.mockResolvedValue({
      ...listFixture,
      title: 'Backlog',
      position: 2,
    });

    const result = await service.createForUser(1, {
      title: ' Backlog ',
    });

    expect(prismaServiceMock.list.count).toHaveBeenCalledWith({
      where: {
        ownerId: 1,
      },
    });
    expect(prismaServiceMock.list.create).toHaveBeenCalledWith({
      data: {
        title: 'Backlog',
        position: 2,
        ownerId: 1,
      },
    });
    expect(result).toMatchObject({ title: 'Backlog', position: 2 });
  });

  it('uses the provided position when creating a list', async () => {
    prismaServiceMock.list.count.mockResolvedValue(2);
    prismaServiceMock.list.create.mockResolvedValue({
      ...listFixture,
      position: 10,
    });

    await service.createForUser(1, {
      title: 'Todo',
      position: 10,
    });

    expect(prismaServiceMock.list.create).toHaveBeenCalledWith({
      data: {
        title: 'Todo',
        position: 10,
        ownerId: 1,
      },
    });
  });

  it('updates an owned list', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue(listFixture);
    prismaServiceMock.list.update.mockResolvedValue({
      ...listFixture,
      title: 'Done',
      position: 3,
    });

    const result = await service.updateForUser(1, listFixture.id, {
      title: ' Done ',
      position: 3,
    });

    expect(prismaServiceMock.list.update).toHaveBeenCalledWith({
      where: { id: listFixture.id },
      data: {
        title: 'Done',
        position: 3,
      },
    });
    expect(result).toMatchObject({ title: 'Done', position: 3 });
  });

  it('throws 404 when updating a missing list', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue(null);

    await expect(
      service.updateForUser(1, 999, { title: 'Missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaServiceMock.list.update).not.toHaveBeenCalled();
  });

  it('throws 403 when updating another user list', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue({
      ...listFixture,
      ownerId: 2,
    });

    await expect(
      service.updateForUser(1, listFixture.id, { title: 'Forbidden' }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaServiceMock.list.update).not.toHaveBeenCalled();
  });

  it('deletes an owned list', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue(listFixture);
    prismaServiceMock.list.delete.mockResolvedValue(listFixture);

    await service.deleteForUser(1, listFixture.id);

    expect(prismaServiceMock.list.delete).toHaveBeenCalledWith({
      where: { id: listFixture.id },
    });
  });

  it('throws 403 when deleting another user list', async () => {
    prismaServiceMock.list.findUnique.mockResolvedValue({
      ...listFixture,
      ownerId: 2,
    });

    await expect(
      service.deleteForUser(1, listFixture.id),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaServiceMock.list.delete).not.toHaveBeenCalled();
  });
});
