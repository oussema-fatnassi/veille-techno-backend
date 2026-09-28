/**
 * Exposes authenticated list routes and their Swagger contract.
 * Delegates persistence and ownership checks to ListsService.
 */

import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list-dto';

@ApiTags('Lists')
@Controller('api/lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Get all lists of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Lists of the current authenticated user',
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            title: 'Todo',
            position: 0,
            ownerId: 1,
            createdAt: '2026-09-26T08:00:00.000Z',
            updatedAt: '2026-09-26T08:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired bearer token',
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
  getLists(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.listsService.findAllForUser(currentUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({
    summary: 'Create a new list for the current user',
    description:
      'Creates a new list owned by the authenticated user. The ownerId is taken from the JWT and cannot be provided by the request body.',
  })
  @ApiBody({
    type: CreateListDto,
    description:
      'List creation payload. The title is required. Position is optional; if omitted, the API places the list at the end.',
    examples: {
      createTodoList: {
        summary: 'Create a todo list',
        value: {
          title: 'Todo',
        },
      },
      createListWithPosition: {
        summary: 'Create a list with explicit position',
        value: {
          title: 'In Progress',
          position: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'A new list is created',
    content: {
      'application/json': {
        example: {
          id: 1,
          title: 'Todo',
          position: 0,
          ownerId: 1,
          createdAt: '2026-09-26T08:00:00.000Z',
          updatedAt: '2026-09-26T08:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error, for example an invalid or missing title.',
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
    description: 'Invalid, missing, or expired bearer token',
    content: {
      'application/json': {
        example: {
          message: 'Invalid or expired token',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  })
  createList(
    @Body() createListDto: CreateListDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.listsService.createForUser(currentUser.id, createListDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a list for the current user',
    description:
      'Updates a list only if the authenticated user owns it. Send only the fields that must change.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the list to update.',
    example: 1,
  })
  @ApiBody({
    type: UpdateListDto,
    description: 'Partial list update payload.',
    examples: {
      updateTitle: {
        summary: 'Update list title',
        value: {
          title: 'Done',
        },
      },
      updatePosition: {
        summary: 'Update list position',
        value: {
          position: 2,
        },
      },
      updateTitleAndPosition: {
        summary: 'Update title and position',
        value: {
          title: 'In Review',
          position: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'List updated successfully.',
    content: {
      'application/json': {
        example: {
          id: 1,
          title: 'Done',
          position: 2,
          ownerId: 1,
          createdAt: '2026-09-26T08:00:00.000Z',
          updatedAt: '2026-09-27T08:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error, for example an invalid title or position.',
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
    description: 'The authenticated user is not the owner of this list.',
    content: {
      'application/json': {
        example: {
          message: 'You cannot access a list owned by another user',
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
  updateList(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateListDto: UpdateListDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.listsService.updateForUser(currentUser.id, id, updateListDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a list for the current user',
    description:
      'Deletes a list owned by the authenticated user. A user cannot delete a list owned by another user.',
  })
  @ApiResponse({
    status: 204,
    description: 'List deleted successfully. No response body is returned.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired bearer token',
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
          message: 'You cannot delete a list owned by another user',
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
  deleteList(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.listsService.deleteForUser(currentUser.id, id);
  }
}
