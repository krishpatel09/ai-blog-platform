import { NestFactory } from '@nestjs/core';
import { setDefaultResultOrder } from 'dns';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3000}`,
  );
}
bootstrap().catch((err) => {
  console.error('Error starting the application', err);
  process.exit(1);
});
