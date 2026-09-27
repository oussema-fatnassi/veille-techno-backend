import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Prisma } from '@prisma/client';

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

  async createForList(
    currentUserId: number,
    listId: number,
    dto: CreateCardDto,
  ) {
    const list = await this.findListOrThrow(listId);
    this.assertCanAccessList(list.ownerId, currentUserId);

    const cardsCount = await this.prisma.card.count({
      where: {
        listId: list.id,
      },
    });

    const cardPosition = dto.position ?? cardsCount;

    return this.prisma.card.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        position: cardPosition,
        listId: list.id,
      },
    });
  }

  async updateCard(currentUserId: number, cardId: number, dto: UpdateCardDto) {
    const card = await this.findCardOrThrow(cardId);
    this.assertCanAccessList(card.list.ownerId, currentUserId);

    if (dto.listId !== undefined) {
      const targetList = await this.findListOrThrow(dto.listId);
      this.assertCanAccessList(targetList.ownerId, currentUserId);
    }

    const updateData: Prisma.CardUncheckedUpdateInput = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title.trim();
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description.trim();
    }

    if (dto.position !== undefined) {
      updateData.position = dto.position;
    }

    if (dto.listId !== undefined) {
      updateData.listId = dto.listId;
    }

    return this.prisma.card.update({
      where: { id: card.id },
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

  private async findCardOrThrow(cardId: number) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
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
