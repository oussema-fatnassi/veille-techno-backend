/**
 * Exposes public registration and login routes with their Swagger contract.
 * Delegates account creation and token issuance to AuthService.
 */

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterRateLimitGuard } from './guards/register-rate-limit.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(RegisterRateLimitGuard)
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates an account if the email is not already used. Always returns the same 202 response so callers cannot tell whether an email has an account. Limited to 5 requests per minute per IP.',
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
  @ApiResponse({
    status: 202,
    description:
      'Registration accepted (same response whether or not the email already had an account)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email, weak password or missing required field',
  })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
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
