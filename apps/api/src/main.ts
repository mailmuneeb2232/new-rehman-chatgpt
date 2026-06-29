import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  );

  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-CSRF-Token'],
  });

  app.use(compression());
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

  // Versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(reflector),
    new TimeoutInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );

  // Swagger
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Electronic Store API')
      .setDescription('Enterprise-grade electronics eCommerce API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .addTag('auth', 'Authentication & Authorization')
      .addTag('products', 'Product catalog management')
      .addTag('categories', 'Category management')
      .addTag('brands', 'Brand management')
      .addTag('cart', 'Shopping cart')
      .addTag('orders', 'Order management')
      .addTag('users', 'User management')
      .addTag('reviews', 'Product reviews')
      .addTag('search', 'Search & discovery')
      .addTag('admin', 'Admin operations')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Electronic Store API running on port ${port} [${nodeEnv}]`);
  if (nodeEnv !== 'production') {
    console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
  }
}

void bootstrap();
