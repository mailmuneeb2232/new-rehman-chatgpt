import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import hpp from 'hpp';
import { env } from '@/config/env';
import { errorHandler } from '@/middleware/error-handler';
import { notFoundHandler } from '@/middleware/not-found-handler';
import { requestIdMiddleware } from '@/middleware/request-id';
import { authRouter } from '@/modules/auth/auth.routes';
import { productsRouter } from '@/modules/products/products.routes';
import { categoriesRouter } from '@/modules/categories/categories.routes';
import { ordersRouter } from '@/modules/orders/orders.routes';
import { cartRouter } from '@/modules/cart/cart.routes';
import { usersRouter } from '@/modules/users/users.routes';
import { reviewsRouter } from '@/modules/reviews/reviews.routes';
import { addressesRouter } from '@/modules/addresses/addresses.routes';
import { wishlistRouter } from '@/modules/wishlist/wishlist.routes';
import { uploadRouter } from '@/modules/upload/upload.routes';
import { webhooksRouter } from '@/modules/webhooks/webhooks.routes';
import { analyticsRouter } from '@/modules/analytics/analytics.routes';
import { searchRouter } from '@/modules/search/search.routes';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  app.use(requestIdMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(compression());
  app.use(hpp());
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const v1 = `/api/${env.API_VERSION}`;

  app.get(`${v1}/health`, (_req, res) => {
    res.json({ status: 'ok', version: env.API_VERSION, timestamp: new Date().toISOString() });
  });

  app.use(`${v1}/auth`, authRouter);
  app.use(`${v1}/products`, productsRouter);
  app.use(`${v1}/categories`, categoriesRouter);
  app.use(`${v1}/orders`, ordersRouter);
  app.use(`${v1}/cart`, cartRouter);
  app.use(`${v1}/users`, usersRouter);
  app.use(`${v1}/reviews`, reviewsRouter);
  app.use(`${v1}/addresses`, addressesRouter);
  app.use(`${v1}/wishlist`, wishlistRouter);
  app.use(`${v1}/upload`, uploadRouter);
  app.use(`${v1}/webhooks`, webhooksRouter);
  app.use(`${v1}/analytics`, analyticsRouter);
  app.use(`${v1}/search`, searchRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
