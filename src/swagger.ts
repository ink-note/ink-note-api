import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerThemeNameEnum } from 'swagger-themes';
import { SwaggerTheme } from 'swagger-themes';

export function SwaggerInitializer(
  path: string,
  app: NestExpressApplication,
): void {
  const config = new DocumentBuilder()
    .setTitle('Ink Note API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const theme = new SwaggerTheme();
  const options = theme.getDefaultConfig(SwaggerThemeNameEnum.DARK);
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(path, app, document, { ...options, explorer: false });
}
