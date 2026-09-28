import { Role } from '@prisma/client';
import { CardsController } from './cards.controller';
import type { CardsService } from './cards.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import type { UpdateCardDto } from './dto/update-card.dto';

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

describe('CardsController', () => {
  let controller: CardsController;
  let cardsServiceMock: {
    deleteCard: jest.Mock;
    getCard: jest.Mock;
    updateCard: jest.Mock;
  };

  const currentUser: AuthenticatedUser = {
    id: 1,
    email: 'user@example.com',
    role: Role.USER,
  };

  beforeEach(() => {
    cardsServiceMock = {
      deleteCard: jest.fn(),
      getCard: jest.fn(),
      updateCard: jest.fn(),
    };
    controller = new CardsController(
      cardsServiceMock as unknown as CardsService,
    );
  });

  it('delegates card retrieval to CardsService', async () => {
    const expectedResult = { id: 1, title: 'Task', listId: 1 };
    cardsServiceMock.getCard.mockResolvedValue(expectedResult);

    const result = await controller.getCard(1, currentUser);

    expect(cardsServiceMock.getCard).toHaveBeenCalledWith(1, 1);
    expect(result).toBe(expectedResult);
  });

  it('delegates card update to CardsService', async () => {
    const updateCardDto: UpdateCardDto = {
      title: 'Updated Task',
    };
    const expectedResult = { id: 1, title: 'Updated Task', listId: 1 };
    cardsServiceMock.updateCard.mockResolvedValue(expectedResult);

    const result = await controller.updateCard(1, updateCardDto, currentUser);

    expect(cardsServiceMock.updateCard).toHaveBeenCalledWith(
      1,
      1,
      updateCardDto,
    );
    expect(result).toBe(expectedResult);
  });

  it('delegates card deletion to CardsService', async () => {
    cardsServiceMock.deleteCard.mockResolvedValue(undefined);

    const result = await controller.deleteCard(1, currentUser);

    expect(cardsServiceMock.deleteCard).toHaveBeenCalledWith(1, 1);
    expect(result).toBeUndefined();
  });
});
