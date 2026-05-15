import { Controller, Post, Body, Headers, Ip } from '@nestjs/common';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';

@Controller('api/v1/share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  async create(
    @Body() dto: CreateShareDto,
    @Headers('x-fingerprint') fingerprint?: string,
    @Ip() ip?: string,
  ) {
    const fp = fingerprint || ip || 'anonymous';
    return this.shareService.create(fp, dto.cardId, dto.platform);
  }
}
