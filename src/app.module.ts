import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';
import { ListsController } from './lists/lists.controller';
import { CardsController } from './cards/cards.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: z.object({
        NODE_ENV: z
          .enum(['development', 'production', 'test'])
          .default('development'),
        PORT: z.coerce.number().int().positive().default(3000),
        DB_HOST: z.string().default('localhost'),
        DB_PORT: z.coerce.number().int().positive().default(5433),
        DB_USER: z.string().default('postgres'),
        DB_PASSWORD: z.string().default('postgres'),
        DB_NAME: z.string().default('veille_kanban'),
        DATABASE_URL: z
          .string()
          .url('DATABASE_URL must be a valid database URL'),
        JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
        JWT_EXPIRES_IN: z.string().default('1h'),
      }),
    }),
    AuthModule,
  ],

  controllers: [
    AppController,
    UsersController,
    ListsController,
    CardsController,
  ],
  providers: [AppService],
})
export class AppModule {}
