import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser'
import { LoggerFactory } from './logger/logger.factory';

async function bootstrap() {
  const loggerService = LoggerFactory();
  const app = await NestFactory.create(AppModule, {
    logger: loggerService
  });

  const configService: ConfigService = app.get(ConfigService);
  app.useLogger(loggerService);
  app.use(cookieParser());
  const port = configService.get<number>('app.port');

  await app.listen(port);

  const appUrl = await app.getUrl();
  loggerService.log(`Server ready on ${appUrl}`, 'NestApplication');

}
bootstrap();
