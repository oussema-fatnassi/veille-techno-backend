import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateCardDto } from './dto/update-card.dto';

@ApiTags('Cards')
@Controller('api/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a card for the current user',
    description:
      'Returns a card only if the authenticated user owns its parent list.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the card to retrieve.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Card retrieved successfully.',
    content: {
      'application/json': {
        example: {
          id: 1,
          title: 'Implement authentication',
          description: 'Add JWT login and protected routes',
          position: 0,
          listId: 1,
          createdAt: '2026-09-27T08:00:00.000Z',
          updatedAt: '2026-09-27T08:00:00.000Z',
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
    description:
      'The authenticated user does not own the parent list of this card.',
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
    description: 'The target card does not exist.',
    content: {
      'application/json': {
        example: {
          message: 'Card not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  getCard(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cardsService.getCard(currentUser.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a card for the current user',
    description:
      'Updates a card only if the authenticated user owns its current parent list. If listId is provided, the target list must also belong to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the card to update.',
    example: 1,
  })
  @ApiBody({
    type: UpdateCardDto,
    description:
      'Partial card update payload. Send only the fields that must change.',
    examples: {
      updateTitle: {
        summary: 'Update card title',
        value: {
          title: 'Updated card title',
        },
      },
      updateDetails: {
        summary: 'Update description and position',
        value: {
          description: 'Updated card description',
          position: 2,
        },
      },
      moveCard: {
        summary: 'Move card to another owned list',
        value: {
          listId: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Card updated successfully.',
    content: {
      'application/json': {
        example: {
          id: 1,
          title: 'Updated card title',
          description: 'Updated card description',
          position: 2,
          listId: 2,
          createdAt: '2026-09-27T08:00:00.000Z',
          updatedAt: '2026-09-27T09:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error, for example an invalid position or listId.',
    content: {
      'application/json': {
        example: {
          message: ['position must be an integer number'],
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
    description:
      'The authenticated user does not own the current parent list or the target list.',
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
    description: 'The card or target list does not exist.',
    content: {
      'application/json': {
        example: {
          message: 'Card not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  updateCard(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cardsService.updateCard(currentUser.id, id, updateCardDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a card for the current user',
    description:
      'Deletes a card only if the authenticated user owns the card parent list.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the card to delete.',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Card deleted successfully. No response body is returned.',
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
    description:
      'The authenticated user does not own the parent list of this card.',
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
    description: 'The target card does not exist.',
    content: {
      'application/json': {
        example: {
          message: 'Card not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  deleteCard(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cardsService.deleteCard(currentUser.id, id);
  }
}
