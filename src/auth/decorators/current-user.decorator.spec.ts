import { Role } from '@prisma/client';
import { CurrentUser } from './current-user.decorator';

jest.mock('@nestjs/common', () => ({
  createParamDecorator: (factory: unknown) => factory,
}));

describe('CurrentUser decorator', () => {
  it('returns the authenticated user from the request', () => {
    const authenticatedUser = {
      id: 1,
      email: 'user@example.com',
      role: Role.USER,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: authenticatedUser,
        }),
      }),
    };

    const result = CurrentUser(undefined, context);

    expect(result).toBe(authenticatedUser);
  });
});
