import {
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { BanUserDto } from './dto/ban-user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('api/admin/users')
@UseGuards(JwtAuthGuard)
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('isBanned') isBanned?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.usersService.list({
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      keyword,
      isBanned: isBanned !== undefined ? isBanned === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  async detail(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.detail(id);
  }

  @Patch(':id/ban')
  async ban(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: BanUserDto) {
    return this.usersService.ban(id, dto);
  }
}
