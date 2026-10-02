import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('@nestjs/common', () => {
  class NotImplementedException extends Error {}

  return {
    Body: () => () => undefined,
    Controller: () => () => undefined,
    HttpCode: () => () => undefined,
    HttpStatus: {
      ACCEPTED: 202,
      CREATED: 201,
      OK: 200,
    },
    Injectable: () => () => undefined,
    NotImplementedException,
    Post: () => () => undefined,
    UseGuards: () => () => undefined,
  };
});

jest.mock('./guards/register-rate-limit.guard', () => ({
  RegisterRateLimitGuard: jest.fn(),
}));

jest.mock('@nestjs/swagger', () => ({
  ApiBody: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiProperty: () => () => undefined,
  ApiPropertyOptional: () => () => undefined,
  ApiResponse: () => () => undefined,
  ApiTags: () => () => undefined,
}));

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

describe('AuthController', () => {
  let authController: AuthController;
  let authServiceMock: {
    login: jest.Mock;
    register: jest.Mock;
  };

  beforeEach(() => {
    authServiceMock = {
      login: jest.fn(),
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
    const expectedResult = { message: 'generic' };

    authServiceMock.register.mockResolvedValue(expectedResult);

    const result = await authController.register(registerDto);

    expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
    expect(result).toBe(expectedResult);
  });

  it('delegates user login to AuthService', async () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'Password1',
    };
    const expectedResult = {
      accessToken: 'signed-jwt',
    };

    authServiceMock.login.mockResolvedValue(expectedResult);

    const result = await authController.login(loginDto);

    expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
    expect(result).toBe(expectedResult);
  });
});
