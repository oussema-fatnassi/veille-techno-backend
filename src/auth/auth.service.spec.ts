import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService, REGISTER_RESPONSE } from './auth.service';

jest.mock('@nestjs/common', () => {
  class UnauthorizedException extends Error {}

  return {
    Injectable: () => () => undefined,
    UnauthorizedException,
  };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
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
  let jwtServiceMock: {
    signAsync: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prismaServiceMock = prismaServiceMockFactory();
    jwtServiceMock = {
      signAsync: jest.fn(),
    };
    service = new AuthService(
      prismaServiceMock as unknown as PrismaService,
      jwtServiceMock as unknown as JwtService,
    );
  });

  it('creates a user with a hashed password and returns the generic response', async () => {
    const registerDto = {
      email: ' User@Example.com ',
      password: 'Password1',
      name: ' Test ',
    };

    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    prismaServiceMock.user.findUnique.mockResolvedValue(null);
    prismaServiceMock.user.create.mockResolvedValue({ id: 1 });

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
    expect(result).toBe(REGISTER_RESPONSE);
  });

  it('returns the same response without creating a user when the email already exists', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
    });

    const result = await service.register({
      email: 'user@example.com',
      password: 'Password1',
      name: 'Test',
    });

    expect(result).toBe(REGISTER_RESPONSE);
    // Hashing still runs so response timing does not reveal the email exists.
    expect(bcrypt.hash).toHaveBeenCalledWith('Password1', 10);
    expect(prismaServiceMock.user.create).not.toHaveBeenCalled();
  });

  it('returns the same response when a concurrent registration hits the unique constraint', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(null);
    prismaServiceMock.user.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'Password1',
        name: 'Test',
      }),
    ).resolves.toBe(REGISTER_RESPONSE);
  });

  it('rethrows unexpected database errors during registration', async () => {
    const dbError = new Error('connection lost');
    prismaServiceMock.user.findUnique.mockResolvedValue(null);
    prismaServiceMock.user.create.mockRejectedValue(dbError);

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'Password1',
        name: 'Test',
      }),
    ).rejects.toBe(dbError);
  });

  it('returns an access token when login credentials are valid', async () => {
    const user = {
      id: 1,
      email: 'user@example.com',
      password: 'hashed-password',
      name: 'Test',
      role: 'USER',
      createdAt: new Date('2026-09-23T12:00:00.000Z'),
    };

    prismaServiceMock.user.findUnique.mockResolvedValue(user);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jwtServiceMock.signAsync.mockResolvedValue('signed-jwt');

    const result = await service.login({
      email: ' User@Example.com ',
      password: 'Password1',
    });

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('Password1', 'hashed-password');
    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: 'user@example.com',
      role: 'USER',
    });
    expect(result).toEqual({ accessToken: 'signed-jwt' });
  });

  it('throws 401 Unauthorized when login email does not exist', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'Password1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });

  it('throws 401 Unauthorized when login password is invalid', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashed-password',
    });
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'WrongPassword1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });
});
