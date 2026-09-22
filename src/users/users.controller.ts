import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Patch, NotImplementedException } from "@nestjs/common";

@ApiTags('Users')
@Controller('api/users/me')
export class UsersController {
  @Get()
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Get the current user' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  getMe() {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Patch()
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Update the current user' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  updateMe() {
    throw new NotImplementedException('Route not implemented yet');
  }
}