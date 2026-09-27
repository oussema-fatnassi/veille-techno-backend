import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list-dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(currentUserId: number) {
    return this.prisma.list.findMany({
      where: {
        ownerId: currentUserId,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async createForUser(currentUserId: number, dto: CreateListDto) {
    const { title, position } = dto;

    const listCount = await this.prisma.list.count({
      where: {
        ownerId: currentUserId,
      },
    });
    const listPosition = position ?? listCount;

    return this.prisma.list.create({
      data: {
        title: title.trim(),
        position: listPosition,
        ownerId: currentUserId,
      },
    });
  }

  async deleteForUser(currentUserId: number, listId: number) {
    const list = await this.findListOrThrow(listId);
    this.assertCanAccessList(list.ownerId, currentUserId);

    await this.prisma.list.delete({
      where: { id: list.id },
    });
  }

  async updateForUser(
    currentUserId: number,
    listId: number,
    dto: UpdateListDto,
  ) {
    const list = await this.findListOrThrow(listId);
    this.assertCanAccessList(list.ownerId, currentUserId);

    const updateData: Prisma.ListUpdateInput = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title.trim();
    }

    if (dto.position !== undefined) {
      updateData.position = dto.position;
    }

    return this.prisma.list.update({
      where: { id: list.id },
      data: updateData,
    });
  }

  private async findListOrThrow(targetListId: number) {
    const list = await this.prisma.list.findUnique({
      where: { id: targetListId },
    });
    if (!list) {
      throw new NotFoundException('List not found');
    }

    return list;
  }

  private assertCanAccessList(ownerId: number, currentUserId: number) {
    const isOwner = ownerId === currentUserId;
    if (!isOwner) {
      throw new ForbiddenException(
        'You cannot access a list owned by another user',
      );
    }
  }
}
