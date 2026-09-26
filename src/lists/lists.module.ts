import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
