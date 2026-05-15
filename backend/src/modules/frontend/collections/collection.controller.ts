import { Controller, Get, Post, Query, Body, Headers, Ip } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionListQueryDto, CheckCollectionDto } from './dto/collection.dto';

@Controller('api/v1/collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  async list(
    @Query() query: CollectionListQueryDto,
    @Headers('x-fingerprint') fingerprint?: string,
    @Ip() ip?: string,
  ) {
    const fp = fingerprint || ip || 'anonymous';
    return this.collectionService.list(fp, query);
  }

  @Post('check')
  async check(
    @Body() dto: CheckCollectionDto,
    @Headers('x-fingerprint') fingerprint?: string,
    @Ip() ip?: string,
  ) {
    const fp = fingerprint || ip || 'anonymous';
    return this.collectionService.check(fp, dto.cardIds);
  }
}
