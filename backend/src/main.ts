import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import config from '../config';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(
    cors({
      origin: [
        'https://klmvsn.nomoredomains.monster',
        'http://klmvsn.nomoredomains.monster',
      ],
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  await app.listen(config().port);
}
bootstrap();
