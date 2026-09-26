import {
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
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListsService } from './lists.service';

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
  })
  @ApiResponse({
    status: 401,
    description: 'Missing, invalid, or expired bearer token',
  })
  getLists(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.listsService.findAllForUser(currentUser.id);
  }

  @Post()
  @ApiOperation({
    summary: '[NOT IMPLEMENTED YET] Create a new list for the current user',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  createList() {
    throw new NotImplementedException('Route not implemented yet');
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
