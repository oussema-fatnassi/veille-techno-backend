import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

jest.mock('@nestjs/common', () => {
  class NotImplementedException extends Error {}

  return {
    Body: () => () => undefined,
    Controller: () => () => undefined,
    Injectable: () => () => undefined,
    NotImplementedException,
    Post: () => () => undefined,
  };
});

jest.mock('@nestjs/swagger', () => ({
  ApiOperation: () => () => undefined,
  ApiResponse: () => () => undefined,
  ApiTags: () => () => undefined,
}));

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: {
    register: jest.Mock;
  };

  beforeEach(() => {
    authServiceMock = {
      register: jest.fn(),
    };
    authController = new AuthController(
      authServiceMock as unknown as AuthService,
    );
  });

  it('delegates user registration to AuthService', async () => {
    const registerDto: RegisterDto = {
      email: 'user@example.com',
      password: 'Password1',
      name: 'Test',
    };
    const expectedResult = {
      id: 1,
      email: 'user@example.com',
      name: 'Test',
      role: 'USER',
      createdAt: new Date('2026-09-23T12:00:00.000Z'),
    };

    authServiceMock.register.mockResolvedValue(expectedResult);

    const result = await authController.register(registerDto);

    expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
    expect(result).toBe(expectedResult);
  });
});
