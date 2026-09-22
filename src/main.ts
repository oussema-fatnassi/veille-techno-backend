import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function bootstrap() {
  requireEnv('DATABASE_URL');

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Kanban Board API')
    .setDescription('The Kanban Board API description')
    .setVersion('1.0')
    .addTag('kanban')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
