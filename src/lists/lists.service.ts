import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListDto } from './dto/create-list.dto';

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
}
