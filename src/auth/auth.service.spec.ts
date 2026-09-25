import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('@nestjs/common', () => {
  class ConflictException extends Error {}
  class UnauthorizedException extends Error {}

  return {
    ConflictException,
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
