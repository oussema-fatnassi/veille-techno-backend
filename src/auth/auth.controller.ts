import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new account with a unique email, hashes the password, and returns the created user without the password.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User information required to create an account.',
    examples: {
      validRegisterPayload: {
        summary: 'Valid registration payload',
        value: {
          email: 'oussema@example.com',
          password: 'Password1!',
          name: 'Oussema Fatnassi',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid email, weak password or missing required field',
  })
  @ApiResponse({ status: 409, description: 'Email already used' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({
    summary: 'Login a user',
    description:
      'Authenticates a user with email and password, then returns a JWT access token to use on protected routes.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credentials of an existing user.',
    examples: {
      validLoginPayload: {
        summary: 'Valid login payload',
        value: {
          email: 'oussema@example.com',
          password: 'Password1!',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 400,
    description: 'Validation error: invalid email or missing required field',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
