import { Role } from '@prisma/client';
import { ListCardsController } from './list-cards.controller';
import type { CardsService } from './cards.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import type { CreateCardDto } from './dto/create-card.dto';

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

describe('ListCardsController', () => {
  let controller: ListCardsController;
  let cardsServiceMock: {
    createForList: jest.Mock;
    findAllForList: jest.Mock;
  };

  const currentUser: AuthenticatedUser = {
    id: 1,
    email: 'user@example.com',
    role: Role.USER,
  };

  beforeEach(() => {
    cardsServiceMock = {
      createForList: jest.fn(),
      findAllForList: jest.fn(),
    };
    controller = new ListCardsController(
      cardsServiceMock as unknown as CardsService,
    );
  });

  it('delegates card retrieval for a list to CardsService', async () => {
    const expectedResult = [{ id: 1, title: 'Task', listId: 1 }];
    cardsServiceMock.findAllForList.mockResolvedValue(expectedResult);

    const result = await controller.getCardsOfList(1, currentUser);

    expect(cardsServiceMock.findAllForList).toHaveBeenCalledWith(1, 1);
    expect(result).toBe(expectedResult);
  });

  it('delegates card creation in a list to CardsService', async () => {
    const createCardDto: CreateCardDto = {
      title: 'Task',
      description: 'Task description',
    };
    const expectedResult = { id: 1, title: 'Task', listId: 1 };
    cardsServiceMock.createForList.mockResolvedValue(expectedResult);

    const result = await controller.createCardInList(
      1,
      createCardDto,
      currentUser,
    );

    expect(cardsServiceMock.createForList).toHaveBeenCalledWith(
      1,
      1,
      createCardDto,
    );
    expect(result).toBe(expectedResult);
  });
});
