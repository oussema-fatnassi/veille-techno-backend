import { ExecutionContext, HttpException } from '@nestjs/common';
import {
  REGISTER_LIMIT,
  REGISTER_WINDOW_MS,
  RegisterRateLimitGuard,
} from './register-rate-limit.guard';

jest.mock('@nestjs/common', () => {
  class HttpException extends Error {}

  return {
    HttpException,
    HttpStatus: { TOO_MANY_REQUESTS: 429 },
    Injectable: () => () => undefined,
  };
});

const contextFor = (ip: string) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ ip }) }),
  }) as ExecutionContext;

describe('RegisterRateLimitGuard', () => {
  afterEach(() => jest.useRealTimers());

  it('blocks an IP over the limit, keeps others allowed, and resets after the window', () => {
    jest.useFakeTimers();
    const guard = new RegisterRateLimitGuard();

    for (let i = 0; i < REGISTER_LIMIT; i++) {
      expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
    }
    expect(() => guard.canActivate(contextFor('1.1.1.1'))).toThrow(
      HttpException,
    );
    expect(guard.canActivate(contextFor('2.2.2.2'))).toBe(true);

    jest.advanceTimersByTime(REGISTER_WINDOW_MS);
    expect(guard.canActivate(contextFor('1.1.1.1'))).toBe(true);
  });
});
