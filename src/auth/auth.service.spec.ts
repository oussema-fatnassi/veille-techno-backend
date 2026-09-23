import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('@nestjs/common', () => {
  class ConflictException extends Error {}

  return {
    ConflictException,
    Injectable: () => () => undefined,
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

type PrismaServiceMock = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
};

const prismaServiceMockFactory = (): PrismaServiceMock => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
});

describe('AuthService', () => {
  let service: AuthService;
  let prismaServiceMock: PrismaServiceMock;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaServiceMock = prismaServiceMockFactory();
    service = new AuthService(prismaServiceMock as unknown as PrismaService);
  });

  it('creates a user with a hashed password and does not return the password', async () => {
    const registerDto = {
      email: ' User@Example.com ',
      password: 'Password1',
      name: ' Test ',
    };
    const expectedUser = {
      id: 1,
      email: 'user@example.com',
      name: 'Test',
      role: 'USER',
      createdAt: new Date('2026-09-23T12:00:00.000Z'),
    };

    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    prismaServiceMock.user.findUnique.mockResolvedValue(null);
    prismaServiceMock.user.create.mockResolvedValue({
      ...expectedUser,
      password: 'hashed-password',
    });

    const result = await service.register(registerDto);

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 10);
    expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'user@example.com',
        password: 'hashed-password',
        name: 'Test',
      },
    });
    expect(result).toEqual(expectedUser);
    expect(result).not.toHaveProperty('password');
  });

  it('throws 409 Conflict when the email already exists', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'Password1',
        name: 'Test',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaServiceMock.user.create).not.toHaveBeenCalled();
  });
});
