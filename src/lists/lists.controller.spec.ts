import { Role } from '@prisma/client';
import { ListsController } from './lists.controller';
import type { ListsService } from './lists.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import type { CreateListDto } from './dto/create-list.dto';
import type { UpdateListDto } from './dto/update-list-dto';

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

describe('ListsController', () => {
  let controller: ListsController;
  let listsServiceMock: {
    createForUser: jest.Mock;
    deleteForUser: jest.Mock;
    findAllForUser: jest.Mock;
    updateForUser: jest.Mock;
  };

  const currentUser: AuthenticatedUser = {
    id: 1,
    email: 'user@example.com',
    role: Role.USER,
  };

  beforeEach(() => {
    listsServiceMock = {
      createForUser: jest.fn(),
      deleteForUser: jest.fn(),
      findAllForUser: jest.fn(),
      updateForUser: jest.fn(),
    };
    controller = new ListsController(
      listsServiceMock as unknown as ListsService,
    );
  });

  it('delegates list retrieval to ListsService', async () => {
    const expectedResult = [{ id: 1, title: 'Todo', ownerId: 1 }];
    listsServiceMock.findAllForUser.mockResolvedValue(expectedResult);

    const result = await controller.getLists(currentUser);

    expect(listsServiceMock.findAllForUser).toHaveBeenCalledWith(1);
    expect(result).toBe(expectedResult);
  });

  it('delegates list creation to ListsService', async () => {
    const createListDto: CreateListDto = {
      title: 'Todo',
    };
    const expectedResult = { id: 1, title: 'Todo', ownerId: 1 };
    listsServiceMock.createForUser.mockResolvedValue(expectedResult);

    const result = await controller.createList(createListDto, currentUser);

    expect(listsServiceMock.createForUser).toHaveBeenCalledWith(
      1,
      createListDto,
    );
    expect(result).toBe(expectedResult);
  });

  it('delegates list update to ListsService', async () => {
    const updateListDto: UpdateListDto = {
      title: 'Done',
    };
    const expectedResult = { id: 1, title: 'Done', ownerId: 1 };
    listsServiceMock.updateForUser.mockResolvedValue(expectedResult);

    const result = await controller.updateList(1, updateListDto, currentUser);

    expect(listsServiceMock.updateForUser).toHaveBeenCalledWith(
      1,
      1,
      updateListDto,
    );
    expect(result).toBe(expectedResult);
  });

  it('delegates list deletion to ListsService', async () => {
    listsServiceMock.deleteForUser.mockResolvedValue(undefined);

    const result = await controller.deleteList(1, currentUser);

    expect(listsServiceMock.deleteForUser).toHaveBeenCalledWith(1, 1);
    expect(result).toBeUndefined();
  });
});
