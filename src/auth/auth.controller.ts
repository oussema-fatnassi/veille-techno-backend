import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Post, NotImplementedException } from "@nestjs/common";

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Register a new user' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  register() {
    throw new NotImplementedException('Route not implemented yet');
  }

  @Post('login')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Login a user' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  login() {
    throw new NotImplementedException('Route not implemented yet');
  }
}