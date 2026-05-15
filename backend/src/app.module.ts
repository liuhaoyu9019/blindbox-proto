import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma.module';
import { AdminAuthModule } from './modules/admin/auth/admin-auth.module';
import { AdminSeriesModule } from './modules/admin/series/admin-series.module';
import { AdminItemsModule } from './modules/admin/items/admin-items.module';
import { AdminUsersModule } from './modules/admin/users/admin-users.module';
import { AdminStatsModule } from './modules/admin/stats/admin-stats.module';
import { SeriesModule } from './modules/frontend/series/series.module';
import { DrawModule } from './modules/frontend/draw/draw.module';
import { CollectionModule } from './modules/frontend/collections/collection.module';
import { ShareModule } from './modules/frontend/share/share.module';

@Module({
  imports: [
    PrismaModule,
    AdminAuthModule,
    AdminSeriesModule,
    AdminItemsModule,
    AdminUsersModule,
    AdminStatsModule,
    SeriesModule,
    DrawModule,
    CollectionModule,
    ShareModule,
  ],
})
export class AppModule {}
