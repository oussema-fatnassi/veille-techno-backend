/**
 * Handles card listing and creation under /api/lists/:listId/cards.
 * Shares CardsService with the individual-card controller for ownership checks.
 */

import {
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardsService } from './cards.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCardDto } from './dto/create-card.dto';

@ApiTags('Cards')
@Controller('api/lists')
export class ListCardsController {
  constructor(private readonly cardsService: CardsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':listId/cards')
  @ApiOperation({
    summary: 'Get all cards of a list',
    description:
      'Returns the cards of a list only if the authenticated user owns that list.',
  })
  @ApiParam({
    name: 'listId',
    type: Number,
    description: 'ID of the list whose cards should be returned.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cards of the selected list.',
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            title: 'Implement authentication',
            description: 'Add JWT login and protected routes',
            position: 0,
            listId: 1,
            createdAt: '2026-09-26T08:00:00.000Z',
            updatedAt: '2026-09-26T08:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired bearer token.',
    content: {
      'application/json': {
        example: {
          message: 'Missing authorization token',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'The authenticated user is not the owner of this list.',
    content: {
      'application/json': {
        example: {
          message: 'You cannot access cards owned by another user',
          error: 'Forbidden',
          statusCode: 403,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'The target list does not exist.',
    content: {
      'application/json': {
        example: {
          message: 'List not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  getCardsOfList(
    @Param('listId', ParseIntPipe) listId: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cardsService.findAllForList(currentUser.id, listId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post(':listId/cards')
  @ApiOperation({
    summary: 'Create a new card for the current user in a list',
    description:
      'Creates a card inside a list only if the authenticated user owns that list. The listId is taken from the URL, not from the request body.',
  })
  @ApiParam({
    name: 'listId',
    type: Number,
    description: 'ID of the list where the card should be created.',
    example: 1,
  })
  @ApiBody({
    type: CreateCardDto,
    description:
      'Card creation payload. The title is required. Description and position are optional.',
    examples: {
      createCard: {
        summary: 'Create a card',
        value: {
          title: 'Implement login',
          description: 'Create JWT login endpoint',
        },
      },
      createCardWithPosition: {
        summary: 'Create a card with explicit position',
        value: {
          title: 'Write tests',
          description: 'Add service and controller tests',
          position: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'A card was created.',
    content: {
      'application/json': {
        example: {
          id: 1,
          title: 'Implement login',
          description: 'Create JWT login endpoint',
          position: 0,
          listId: 1,
          createdAt: '2026-09-27T08:00:00.000Z',
          updatedAt: '2026-09-27T08:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error, for example a missing or empty title.',
    content: {
      'application/json': {
        example: {
          message: ['title should not be empty', 'title must be a string'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired bearer token.',
    content: {
      'application/json': {
        example: {
          message: 'Missing authorization token',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'The authenticated user is not the owner of this list.',
    content: {
      'application/json': {
        example: {
          message: 'You cannot access cards owned by another user',
          error: 'Forbidden',
          statusCode: 403,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'The target list does not exist.',
    content: {
      'application/json': {
        example: {
          message: 'List not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  createCardInList(
    @Param('listId', ParseIntPipe) listId: number,
    @Body() createCardDto: CreateCardDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cardsService.createForList(
      currentUser.id,
      listId,
      createCardDto,
    );
  }
}
