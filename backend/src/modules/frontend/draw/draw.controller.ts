import { Controller, Post, Body, Headers, Ip } from '@nestjs/common';
import { DrawService } from './draw.service';
import { ExecuteDrawDto } from './dto/execute-draw.dto';

@Controller('api/v1/draw')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Post('execute')
  async execute(
    @Body() dto: ExecuteDrawDto,
    @Headers('x-fingerprint') fingerprint?: string,
    @Ip() ip?: string,
  ) {
    const fp = fingerprint || ip || 'anonymous';
    return this.drawService.execute(dto.seriesId, fp);
  }
}
