import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesListQueryDto } from './dto/series-list-query.dto';

@Controller('api/v1/series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async list(@Query() query: SeriesListQueryDto) {
    return this.seriesService.list(query);
  }

  @Get(':id')
  async detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.seriesService.detail(id);
  }
}
