import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForList(currentUserId: number, listId: number) {
    const list = await this.findListOrThrow(listId);

    this.assertCanAccessList(list.ownerId, currentUserId);
    return this.prisma.card.findMany({
      where: {
        listId: list.id,
      },
      orderBy: {
        position: 'asc',
      },
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
        'You cannot access cards owned by another user',
      );
    }
  }
}
