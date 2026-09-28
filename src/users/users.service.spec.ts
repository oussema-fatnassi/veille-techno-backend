import { ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('@nestjs/common', () => {
  class ForbiddenException extends Error {}
  class NotFoundException extends Error {}

  return {
    ForbiddenException,
    Injectable: () => () => undefined,
    NotFoundException,
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

type PrismaServiceMock = {
  user: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

const prismaServiceMockFactory = (): PrismaServiceMock => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

const userFixture = {
  id: 1,
  email: 'user@example.com',
  password: 'hashed-password',
  name: 'User',
  role: Role.USER,
  createdAt: new Date('2026-09-27T08:00:00.000Z'),
};

describe('UsersService', () => {
  let service: UsersService;
  let prismaServiceMock: PrismaServiceMock;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaServiceMock = prismaServiceMockFactory();
    service = new UsersService(prismaServiceMock as unknown as PrismaService);
  });

  it('returns the current user without the password', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(userFixture);

    const result = await service.getCurrentUser(userFixture.id);

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: userFixture.id },
    });
    expect(result).toEqual({
      id: 1,
      email: 'user@example.com',
      name: 'User',
      role: Role.USER,
      createdAt: new Date('2026-09-27T08:00:00.000Z'),
    });
    expect(result).not.toHaveProperty('password');
  });

  it('throws 404 when the current user does not exist', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(null);

    await expect(service.getCurrentUser(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('allows a user to update their own profile', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(userFixture);
    prismaServiceMock.user.update.mockResolvedValue({
      ...userFixture,
      email: 'new@example.com',
      name: 'Updated User',
    });

    const result = await service.updateUser(
      userFixture.id,
      {
        email: ' New@Example.com ',
        name: ' Updated User ',
      },
      {
        id: userFixture.id,
        email: userFixture.email,
        role: Role.USER,
      },
    );

    expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
      where: { id: userFixture.id },
      data: {
        email: 'new@example.com',
        name: 'Updated User',
      },
    });
    expect(result).not.toHaveProperty('password');
  });

  it('hashes the password when updating it', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(userFixture);
    jest.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);
    prismaServiceMock.user.update.mockResolvedValue({
      ...userFixture,
      password: 'new-hashed-password',
    });

    await service.updateUser(
      userFixture.id,
      { password: 'Password1!' },
      {
        id: userFixture.id,
        email: userFixture.email,
        role: Role.USER,
      },
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('Password1!', 10);
    expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
      where: { id: userFixture.id },
      data: {
        password: 'new-hashed-password',
      },
    });
  });

  it('forbids a regular user from updating another user', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue({
      ...userFixture,
      id: 2,
    });

    await expect(
      service.updateUser(
        2,
        { name: 'Forbidden' },
        {
          id: 1,
          email: 'user@example.com',
          role: Role.USER,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
  });

  it('forbids a regular user from updating a role', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(userFixture);

    await expect(
      service.updateUser(
        userFixture.id,
        { role: Role.ADMIN },
        {
          id: userFixture.id,
          email: userFixture.email,
          role: Role.USER,
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prismaServiceMock.user.update).not.toHaveBeenCalled();
  });

  it('allows an admin to update another user role', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(userFixture);
    prismaServiceMock.user.update.mockResolvedValue({
      ...userFixture,
      role: Role.ADMIN,
    });

    const result = await service.updateUser(
      userFixture.id,
      { role: Role.ADMIN },
      {
        id: 99,
        email: 'admin@example.com',
        role: Role.ADMIN,
      },
    );

    expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
      where: { id: userFixture.id },
      data: {
        role: Role.ADMIN,
      },
    });
    expect(result).toMatchObject({ role: Role.ADMIN });
    expect(result).not.toHaveProperty('password');
  });
});
