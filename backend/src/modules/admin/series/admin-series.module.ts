import { Module } from '@nestjs/common';
import { AdminSeriesController } from './admin-series.controller';
import { AdminSeriesService } from './admin-series.service';
import { AdminItemsService } from '../items/admin-items.service';

@Module({
  controllers: [AdminSeriesController],
  providers: [AdminSeriesService, AdminItemsService],
})
export class AdminSeriesModule {}
