import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';

import { SwaggerInitializer } from './swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<string> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables>);
  const _IS_DEV_ = config.get<string>('NODE_ENV') === 'development';
  const _IS_PROD_ = config.get<string>('NODE_ENV') === 'production';

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,POST,OPTIONS',
    allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With'],
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (_IS_DEV_) {
    SwaggerInitializer('api/docs', app);
  }
  app.enableShutdownHooks();
  await app.listen(parseInt(config.get<string>('PORT')) || 8000);
  return app.getUrl();
}

(async (): Promise<void> => {
  try {
    const url = await bootstrap();
    Logger.log('Server started', url + '/api');
    Logger.log('Swagger started (running only in development)', url + '/api/docs');
  } catch (error) {
    Logger.error('Server start error: ', error);
  }
})();
