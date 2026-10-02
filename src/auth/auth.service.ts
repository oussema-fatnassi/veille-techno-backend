/**
 * Handles registration and login using Prisma, bcrypt and JwtService.
 * Registration answers identically for new and existing emails to avoid account enumeration.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

export const REGISTER_RESPONSE = {
  message:
    'If this email is available, your account has been created. You can now try to log in.',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    const normalizedEmail = email.trim().toLowerCase();
    // Hash before the lookup so both branches take about the same time.
    const hash = await bcrypt.hash(password, 10);
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      try {
        await this.prisma.user.create({
          data: { email: normalizedEmail, password: hash, name: name.trim() },
        });
      } catch (error) {
        // A concurrent registration won the unique constraint: same answer.
        if ((error as { code?: string }).code !== 'P2002') throw error;
      }
    }

    return REGISTER_RESPONSE;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordCheck = await bcrypt.compare(password, existing.password);
    if (!passwordCheck) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: existing.id,
      email: existing.email,
      role: existing.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
