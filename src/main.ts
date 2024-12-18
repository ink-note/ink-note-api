import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';

import { SwaggerInitializer } from './common/configs/swagger-init';
import { AppModule } from './app.module';

import { corsDevOptions, corsProdOptions } from './common/configs/cors-options';
import { ROUTES } from './common/constants/routes';

async function bootstrap(): Promise<string> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables>);

  const NODE_ENV = config.getOrThrow<string>('NODE_ENV');
  const _IS_DEV_ = NODE_ENV === 'development';

  app.setGlobalPrefix('api');
  app.enableCors(_IS_DEV_ ? corsDevOptions : corsProdOptions);

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (_IS_DEV_) {
    SwaggerInitializer(ROUTES.API.DOCS, app);
  }
  app.enableShutdownHooks();
  await app.listen(parseInt(config.getOrThrow<string>('PORT')) || 8000);
  return app.getUrl();
}

(async (): Promise<void> => {
  try {
    const url = await bootstrap();
    Logger.log('Server started', url + '/api');
    Logger.log('Swagger started (running only in development)', url + `/${ROUTES.API.DOCS}`);
  } catch (error) {
    Logger.error('Server start error: ', error);
  }
})();
