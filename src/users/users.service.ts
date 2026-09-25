import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Role, Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUser(
    targetUserId: number,
    dto: UpdateUserDto,
    currentUser: AuthenticatedUser,
  ) {
    const targetUser = await this.findUserOrThrow(targetUserId);
    this.assertCanUpdateUser(currentUser, targetUserId, dto);
    const updateData = await this.buildUpdateData(dto);

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUser.id },
      data: updateData,
    });

    return this.toSafeUser(updatedUser);
  }

  private async findUserOrThrow(targetUserId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private assertCanUpdateUser(
    currentUser: AuthenticatedUser,
    targetUserId: number,
    dto: UpdateUserDto,
  ) {
    const isAdmin = currentUser.role == Role.ADMIN;
    const isSelfUpdate = currentUser.id === targetUserId;
    const isTryingtoUpdateRole = dto.role !== undefined;

    if (!isAdmin && !isSelfUpdate) {
      throw new ForbiddenException('You cannot update another user');
    }

    if (!isAdmin && isTryingtoUpdateRole) {
      throw new ForbiddenException('Only an admin can update user roles');
    }
  }

  private async buildUpdateData(dto: UpdateUserDto) {
    const { email, name, password, role } = dto;

    const updateData: Prisma.UserUpdateInput = {};

    if (email) {
      updateData.email = email.trim().toLowerCase();
    }

    if (name) {
      updateData.name = name.trim();
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updateData.password = hash;
    }

    if (role) {
      updateData.role = role;
    }

    return updateData;
  }

  private toSafeUser(user: User) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
