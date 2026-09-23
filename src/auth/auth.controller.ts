import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Post, NotImplementedException, Body } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {

  constructor(private readonly authService: AuthService){}


  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email, weak password or missing required field'})
  @ApiResponse({ status: 409, description: 'Email already used'})
  register(@Body() registerDto: RegisterDto ) {
    return this.authService.register(registerDto)
    //throw new NotImplementedException('Route not implemented yet');
  }

  @Post('login')
  @ApiOperation({ summary: '[NOT IMPLEMENTED YET] Login a user' })
  @ApiResponse({ status: 501, description: 'Not Implemented yet' })
  login() {
    throw new NotImplementedException('Route not implemented yet');
  }
}