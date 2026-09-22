import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get,Post, Patch, Delete, NotImplementedException, Param } from "@nestjs/common";

@ApiTags('Cards')
@Controller('api/cards')
export class CardsController {
  @Get(':listId/cards')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Get all cards of a list' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  getCardsOfList(@Param('listId') id:string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Post(':listId/cards')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Create a new card for the current user in a list' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  createCardInList(@Param('listId') listId: string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Get(':id')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Get a card for the current user' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  getCard(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Patch(':id')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Update a card for the current user (title, description, position, list)' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  updateCard(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Delete(':id')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Delete a card for the current user' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  deleteCard(@Param('id') id: string) {
    throw new NotImplementedException('Route not implemented yet');
  }
}