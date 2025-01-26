import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // use global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove fields that are not in the DTO
      forbidNonWhitelisted: true, // throw error if field is not in the DTO
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();
