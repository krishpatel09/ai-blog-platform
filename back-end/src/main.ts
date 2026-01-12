import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { setDefaultResultOrder } from 'dns';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  setDefaultResultOrder('ipv4first');
  const logger = new Logger('Bootstrap');
  if (!process.env.DATABASE_URL) {
    logger.error('❌ DATABASE_URL is not defined in .env file!');
  } else {
    logger.log('✅ Environment variables loaded successfully');
  }
  const app = await NestFactory.create(AppModule);

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
  // app.useGlobalFilters(
  //   new HttpExceptionFilter(),
  //   new PrismaExceptionFilter()
  // );

  // app.useGlobalInterceptors(
  //   new LoggingInterceptor(),
  //   new TransformInterceptor()
  // );

  // // --- 5. Swagger API Documentation ---
  // if (process.env.NODE_ENV !== 'production') {
  //   const config = new DocumentBuilder()
  //     .setTitle('Genwrite AI Blog Platform')
  //     .setDescription('The official API documentation for Genwrite AI platform')
  //     .setVersion('1.0')
  //     .addBearerAuth()
  //     .build();
  //   const document = SwaggerModule.createDocument(app, config);
  //   SwaggerModule.setup('docs', app, document);
  //   logger.log('🚀 Swagger documentation available at /docs');
  // }


  await app.listen(process.env.PORT || 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT || 3000}`,
  );
}
bootstrap().catch((err) => {
  console.error('Error starting the application', err);
  process.exit(1);
});
