import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { VideosModule } from './videos/videos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { CsrfMiddleware } from './auth/csrf.middleware';

import { FileSystemModule } from './file-system/file-system.module';
import { QuizModule } from './quiz/quiz.module';
import { EventsModule } from './events/events.module';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from './chat/chat.module';
import { RefreshTokenInterceptor } from './auth/refresh-token.interceptor';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ZoomModule } from './zoom/zoom.module';
import { StripeModule } from './stripe/stripe.module';
import { HeaderResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { PaymentsModule } from './payments/payments.module';
import { StatsModule } from './stats/stats.module';
import { WebPushModule } from './web-push/web-push.module';
import path from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LogSnagModule } from './log-snag/log-snag.module';
import { WoocommerceModule } from './woocommerce/woocommerce.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      load: [
        () => ({
          SECURE_COOKIES: process.env.NODE_ENV === 'production',
          CORS_ORIGINS: [process.env.CORS_ORIGIN_1, process.env.CORS_ORIGIN_2],
        }),
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        AUTH_COOKIE_NAME: Joi.string().default(
          '__aula_anclademia_sessiontoken',
        ),
        JWT_SECRET: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),
        S3_ACCESS_KEY_ID: Joi.string().required(),
        S3_SECRET_ACCESS_KEY: Joi.string().required(),
        S3_REGION: Joi.string().required(),
        S3_ENDPOINT: Joi.string().required(),
        S3_PUBLIC_URL: Joi.string().required(),
        S3_PUBLIC_BUCKET_NAME: Joi.string().required(),
        S3_PRIVATE_BUCKET_NAME: Joi.string().required(),
        CORS_ORIGIN_1: Joi.string().required(),
        CORS_ORIGIN_2: Joi.string().required(),
        HOST_DOMAIN: Joi.string().required(),
        SENDINBLUE_API_KEY: Joi.string().required(),
        GENERATE_RANDOM_PROFILE_PICTURE: Joi.boolean().default(false),
        ZOOM_WEBHOOK_SECRET: Joi.string().required(),
        VAPID_PUBLIC_KEY: Joi.string().required(),
        VAPID_PRIVATE_KEY: Joi.string().required(),
        AUTH_SESSION_DURATION_MS: Joi.number().default(1000 * 60 * 60 * 24 * 3),
        PASSWORD_RECOVERY_TOKEN_DURATION_MS: Joi.number().default(
          1000 * 60 * 30,
        ),
        LOG_SNAG_API_KEY: Joi.string().optional(),
        LOG_SNAG_ACTIVE: Joi.boolean().default(false),
        LOG_SNAG_PROJECT: Joi.string().optional().default('aula-anclademia'),
        WOOCOMMERCE_API_KEY: Joi.string().required(),
        WOOCOMMERCE_API_SECRET: Joi.string().required(),
        WOOCOMMERCE_API_BASE_URL: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    VideosModule,
    ConfigModule,
    FileSystemModule,
    QuizModule,
    EventsModule,
    EmailModule,
    ScheduleModule.forRoot(),
    ChatModule,
    ZoomModule,
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        isActivated: false,
        apiKey: null, // process.env.STRIPE_API_KEY, if it was activated
        options: {
          apiVersion: '2023-08-16',
        },
      }),
    }),
    I18nModule.forRoot({
      resolvers: [new HeaderResolver(['x-lang'])],
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      loader: I18nJsonLoader,
    }),
    PaymentsModule,
    StatsModule,
    WebPushModule,
    EventEmitterModule.forRoot({
      global: true,
    }),
    LogSnagModule,
    WoocommerceModule,
    ThrottlerModule.forRoot([
      {
        ttl: 15000, // 15 seconds
        limit: 30, // 50 req / 15 seconds
      },
    ]),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).exclude('zoom/webhook').forRoutes('*');
  }
}
