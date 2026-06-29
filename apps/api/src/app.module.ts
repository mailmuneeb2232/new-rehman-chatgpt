import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { configValidationSchema } from './config/config.validation';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CompareModule } from './modules/compare/compare.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { SearchModule } from './modules/search/search.module';
import { UploadModule } from './modules/upload/upload.module';
import { EmailModule } from './modules/email/email.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CmsModule } from './modules/cms/cms.module';
import { SupportModule } from './modules/support/support.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { QueuesModule } from './modules/queues/queues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: { allowUnknown: false, abortEarly: true },
    }),
    ThrottlerModule.forRoot([{
      name: 'global',
      ttl: 60000,
      limit: 100,
    }]),
    ScheduleModule.forRoot(),
    TerminusModule,
    PrismaModule,
    RedisModule,
    QueuesModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    CompareModule,
    CouponsModule,
    AddressesModule,
    SearchModule,
    UploadModule,
    EmailModule,
    NotificationsModule,
    PaymentsModule,
    WebhooksModule,
    AnalyticsModule,
    CmsModule,
    SupportModule,
    SettingsModule,
    ShippingModule,
    InventoryModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
