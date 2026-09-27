import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Patch,
  Delete,
  NotImplementedException,
  Param,
} from '@nestjs/common';
import { CardsService } from './cards.service';

@ApiTags('Cards')
@Controller('api/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

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
