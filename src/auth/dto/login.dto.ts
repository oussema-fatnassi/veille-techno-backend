import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@test.com',
    description: 'Email address of an existing user.',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: 'Test1234.',
    description: 'Password of the user account.',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
