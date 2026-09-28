import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';

jest.mock('@nestjs/common', () => {
  class UnauthorizedException extends Error {}

  return {
    Injectable: () => () => undefined,
    UnauthorizedException,
  };
});

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

type RequestMock = {
  headers: {
    authorization?: string;
  };
  user?: {
    id: number;
    email: string;
    role: Role;
  };
};

function createExecutionContext(request: RequestMock): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtServiceMock: {
    verifyAsync: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jwtServiceMock = {
      verifyAsync: jest.fn(),
    };
    guard = new JwtAuthGuard(jwtServiceMock as unknown as JwtService);
  });

  it('allows a request with a valid bearer token and attaches the user', async () => {
    const request: RequestMock = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };
    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'user@example.com',
      role: Role.USER,
    });

    const result = await guard.canActivate(createExecutionContext(request));

    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(result).toBe(true);
    expect(request.user).toEqual({
      id: 1,
      email: 'user@example.com',
      role: Role.USER,
    });
  });

  it('throws 401 when the authorization header is missing', async () => {
    const request: RequestMock = {
      headers: {},
    };

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('throws 401 when the authorization header is not a bearer token', async () => {
    const request: RequestMock = {
      headers: {
        authorization: 'Basic invalid-token',
      },
    };

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('throws 401 when the bearer token is empty', async () => {
    const request: RequestMock = {
      headers: {
        authorization: 'Bearer',
      },
    };

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('throws 401 when the token is invalid or expired', async () => {
    const request: RequestMock = {
      headers: {
        authorization: 'Bearer expired-token',
      },
    };
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('expired-token');
    expect(request.user).toBeUndefined();
  });
});
