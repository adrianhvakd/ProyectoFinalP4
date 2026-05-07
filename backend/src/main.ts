import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json());
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
