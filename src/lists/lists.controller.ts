import {
  ApiBody,
  ApiOperation,
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
  NotImplementedException,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';

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

  @Patch(':id')
  @ApiOperation({
    summary:
      '[NOT IMPLEMENTED YET] Update a list for the current user (title, position)',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  updateList(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Delete(':id')
  @ApiOperation({
    summary: '[NOT IMPLEMENTED YET] Delete a list for the current user',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  deleteList(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }
}
