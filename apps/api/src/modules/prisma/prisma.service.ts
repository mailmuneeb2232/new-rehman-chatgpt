import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    super({
      log: config.get('NODE_ENV') === 'development'
        ? [{ emit: 'event', level: 'query' }, { emit: 'stdout', level: 'error' }]
        : [{ emit: 'stdout', level: 'error' }],
      errorFormat: 'minimal',
    });

    // Soft delete middleware
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      const softDeleteModels = ['User', 'Product', 'Order'];

      if (softDeleteModels.includes(params.model ?? '')) {
        if (params.action === 'delete') {
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }
        if (['findFirst', 'findMany', 'findUnique', 'count'].includes(params.action)) {
          if (params.args === undefined) params.args = {};
          if (params.args.where !== undefined) {
            if (params.args.where.deletedAt === undefined) {
              params.args.where['deletedAt'] = null;
            }
          } else {
            params.args['where'] = { deletedAt: null };
          }
        }
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (this.config.get('NODE_ENV') === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }
    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>(
      Prisma.sql`SELECT tablename FROM pg_tables WHERE schemaname='public'`,
    );
    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        await this.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
      }
    }
  }
}
