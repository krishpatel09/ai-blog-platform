import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { setDefaultResultOrder } from 'dns';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { CookieInterceptor } from './common/interceptors/cookie.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');
  const logger = new Logger('Bootstrap');
  if (!process.env.DATABASE_URL) {
    logger.error('❌ DATABASE_URL is not defined in .env file!');
  } else {
    logger.log('✅ Environment variables loaded successfully');
  }

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  //Global config
  app.setGlobalPrefix('api');
  app.use(cookieParser());
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
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new CookieInterceptor(), new LoggingInterceptor());

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3000}`,
  );
}
bootstrap().catch((err) => {
  console.error('Error starting the application', err);
  process.exit(1);
});
