import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { PrismaClientExceptionFilter } from './database/database.exception-filter';
import { HttpExceptionFilter } from './common/http.exception-filter';
import { I18nService } from 'nestjs-i18n';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  app.use(helmet());
  app.use(cookieParser(configService.getOrThrow('COOKIE_SECRET')));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // this will remove all the properties that are not in the DTO
      forbidNonWhitelisted: true, // this will throw an error if there are properties that are not in the DTO
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);

  const i18nService = app.get(I18nService) as I18nService;

  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
    new HttpExceptionFilter(i18nService),
  );
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = configService.getOrThrow('CORS_ORIGINS');
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Aula anclademia backend')
    .setVersion('1.0')
    .setVersion('1.0')
    .addGlobalParameters({
      name: 'x-csrf-protection',
      in: 'header',
      required: true,
    })
    .build();

  // @ts-ignore
  const document = SwaggerModule.createDocument(app, config);
  // @ts-ignore
  SwaggerModule.setup('docs', app, document);

  app.listen(configService.getOrThrow<number>('PORT'));
}
bootstrap();
