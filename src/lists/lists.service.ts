import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
