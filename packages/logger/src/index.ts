import pino from 'pino';

const isDev = process.env['NODE_ENV'] !== 'production';

export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
  base: {
    env: process.env['NODE_ENV'],
    service: process.env['SERVICE_NAME'] ?? 'electronic-store',
  },
  redact: {
    paths: ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'cookie'],
    remove: true,
  },
});

export type Logger = typeof logger;
