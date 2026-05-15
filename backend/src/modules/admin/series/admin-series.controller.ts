import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminSeriesService } from './admin-series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminItemsService } from '../items/admin-items.service';
import { Rarity } from '@prisma/client';

@Controller('api/admin/series')
@UseGuards(JwtAuthGuard)
export class AdminSeriesController {
  constructor(
    private readonly seriesService: AdminSeriesService,
    private readonly itemsService: AdminItemsService,
  ) {}

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.seriesService.list({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      keyword,
      sortBy,
      sortOrder,
    });
  }

  @Post()
  async create(@Body() dto: CreateSeriesDto) {
    return this.seriesService.create(dto);
  }

  @Put(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateSeriesDto) {
    return this.seriesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.seriesService.delete(id);
  }

  @Get(':id/items')
  async listItems(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('rarity') rarity?: Rarity,
    @Query('keyword') keyword?: string,
  ) {
    return this.itemsService.listBySeries(id, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      rarity,
      keyword,
    });
  }
}
