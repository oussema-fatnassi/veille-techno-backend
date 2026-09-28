import { Role } from '@prisma/client';
import { UsersController } from './users.controller';
import type { UsersService } from './users.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import type { UpdateUserDto } from './dto/update-user.dto';

jest.mock('@nestjs/common', () => {
  const noopDecorator = () => () => undefined;

  return {
    Body: noopDecorator,
    Controller: noopDecorator,
    createParamDecorator: jest.fn(() => noopDecorator),
    Delete: noopDecorator,
    Get: noopDecorator,
    HttpCode: noopDecorator,
    HttpStatus: {
      CREATED: 201,
      NO_CONTENT: 204,
      OK: 200,
    },
    Injectable: noopDecorator,
    Param: noopDecorator,
    ParseIntPipe: jest.fn(),
    Patch: noopDecorator,
    Post: noopDecorator,
    UnauthorizedException: class UnauthorizedException extends Error {},
    UseGuards: noopDecorator,
  };
});

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

describe('UsersController', () => {
  let controller: UsersController;
  let usersServiceMock: {
    getCurrentUser: jest.Mock;
    updateUser: jest.Mock;
  };

  const currentUser: AuthenticatedUser = {
    id: 1,
    email: 'user@example.com',
    role: Role.USER,
  };

  beforeEach(() => {
    usersServiceMock = {
      getCurrentUser: jest.fn(),
      updateUser: jest.fn(),
    };
    controller = new UsersController(
      usersServiceMock as unknown as UsersService,
    );
  });

  it('delegates current user retrieval to UsersService', async () => {
    const expectedResult = {
      id: 1,
      email: 'user@example.com',
      name: 'User',
      role: Role.USER,
    };
    usersServiceMock.getCurrentUser.mockResolvedValue(expectedResult);

    const result = await controller.getCurrentUser(currentUser);

    expect(usersServiceMock.getCurrentUser).toHaveBeenCalledWith(1);
    expect(result).toBe(expectedResult);
  });

  it('delegates user update to UsersService', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
    };
    const expectedResult = {
      id: 1,
      email: 'user@example.com',
      name: 'Updated User',
      role: Role.USER,
    };
    usersServiceMock.updateUser.mockResolvedValue(expectedResult);

    const result = await controller.updateUser(1, updateUserDto, currentUser);

    expect(usersServiceMock.updateUser).toHaveBeenCalledWith(
      1,
      updateUserDto,
      currentUser,
    );
    expect(result).toBe(expectedResult);
  });
});
