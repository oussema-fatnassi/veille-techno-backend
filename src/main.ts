import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');

  const config = new DocumentBuilder()
    .setTitle('Kanban Board API')
    .setDescription('The Kanban Board API description')
    .setVersion('1.0')
    .addTag('kanban')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port);
}
void bootstrap();
