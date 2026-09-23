import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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
}
