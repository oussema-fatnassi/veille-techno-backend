import {
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
  Patch,
  Delete,
  NotImplementedException,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardsService } from './cards.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Cards')
@Controller('api/lists')
export class CardsController {
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

  @Post(':listId/cards')
  @ApiOperation({
    summary:
      '[NOT IMPLEMENTED YET] Create a new card for the current user in a list',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  createCardInList(@Param('listId') listId: string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Get(':id')
  @ApiOperation({
    summary: '[NOT IMPLEMENTED YET] Get a card for the current user',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  getCard(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      '[NOT IMPLEMENTED YET] Update a card for the current user (title, description, position, list)',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  updateCard(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Delete(':id')
  @ApiOperation({
    summary: '[NOT IMPLEMENTED YET] Delete a card for the current user',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  deleteCard(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }
}
