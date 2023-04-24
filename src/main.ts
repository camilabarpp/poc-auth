import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { QueryFailedExceptionFilter } from './exceptions/exceptions.filter';
import { winstonConfig } from './configs/winston.config';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  const app = await NestFactory.create(AppModule, { logger });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new QueryFailedExceptionFilter());
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap().then(() => 'Application started');
