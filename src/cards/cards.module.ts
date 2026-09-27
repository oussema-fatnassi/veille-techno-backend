import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { ListCardsController } from './list-cards.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CardsController, ListCardsController],
  providers: [CardsService],
})
export class CardsModule {}
