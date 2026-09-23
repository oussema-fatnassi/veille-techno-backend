import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  NotImplementedException,
  Param,
} from '@nestjs/common';

@ApiTags('Lists')
@Controller('api/lists')
export class ListsController {
  @Get()
  @ApiOperation({
    summary: '[NOT IMPLEMENTED YET] Get all lists of the current user',
  })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  getLists() {
    throw new NotImplementedException('Route not implemented yet');
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
