import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  APP_PORT: Joi.number().default(4000),
  APP_URL: Joi.string().uri().default('http://localhost:4000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  ADMIN_URL: Joi.string().uri().default('http://localhost:3001'),

  DATABASE_URL: Joi.string().required(),

  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  CLOUDINARY_UPLOAD_PRESET: Joi.string().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM_NAME: Joi.string().default('Electronic Store'),
  SMTP_FROM_EMAIL: Joi.string().email().required(),

  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().required(),

  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  COOKIE_SECRET: Joi.string().min(32).required(),
  ENCRYPTION_KEY: Joi.string().min(32).required(),

  MAX_LOGIN_ATTEMPTS: Joi.number().default(5),
  LOCKOUT_DURATION_MINUTES: Joi.number().default(15),

  STORE_NAME: Joi.string().default('Electronic Store'),
  STORE_EMAIL: Joi.string().email().default('store@electronicstore.com'),
  STORE_OWNER_EMAIL: Joi.string().email().default('owner@electronicstore.com'),
  STORE_PHONE: Joi.string().default('+1 (800) 000-0000'),
  STORE_ADDRESS: Joi.string().default('123 Tech Street, San Francisco, CA 94105'),
});
