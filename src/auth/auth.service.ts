import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Email already used');
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email: normalizedEmail, password: hash, name: name.trim() },
    });

    const { password: _password, ...safeUser } = user;

    return safeUser;
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
