import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('api/admin/stats')
@UseGuards(JwtAuthGuard)
export class AdminStatsController {
  constructor(private readonly statsService: AdminStatsService) {}

  @Get()
  async stats() {
    return this.statsService.stats();
  }
}
