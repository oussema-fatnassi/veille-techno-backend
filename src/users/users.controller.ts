import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Updates a user profile. A regular user can update only their own profile and cannot update role. An admin can update another user and can update role.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the user to update.',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description:
      'Partial user update payload. Send only the fields that must change.',
    examples: {
      updateName: {
        summary: 'Update own name',
        value: {
          name: 'Oussema Updated',
        },
      },
      updateEmail: {
        summary: 'Update own email',
        value: {
          email: 'oussema.updated@example.com',
        },
      },
      updatePassword: {
        summary: 'Update own password',
        value: {
          password: 'Password1',
        },
      },
      adminUpdateRole: {
        summary: 'Admin updates a user role',
        value: {
          role: 'ADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully. Password is never returned.',
    content: {
      'application/json': {
        example: {
          id: 1,
          email: 'oussema.updated@example.com',
          name: 'Oussema Updated',
          role: 'USER',
          createdAt: '2026-09-25T08:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error, for example an invalid role or email.',
    content: {
      'application/json': {
        example: {
          message: ['role must be one of the following values: USER, ADMIN'],
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
          message: 'Invalid or expired token',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden update, for example a regular user updating another profile or trying to change role.',
    content: {
      'application/json': {
        example: {
          message: 'Only an admin can update user roles',
          error: 'Forbidden',
          statusCode: 403,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'The target user does not exist.',
    content: {
      'application/json': {
        example: {
          message: 'User not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    },
  })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.updateUser(id, updateUserDto, currentUser);
  }
}
