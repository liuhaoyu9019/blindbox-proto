import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Rarity } from '@prisma/client';

@Injectable()
export class AdminItemsService {
  constructor(private prisma: PrismaService) {}

  async listBySeries(
    seriesId: string,
    query: {
      page?: number;
      pageSize?: number;
      rarity?: Rarity;
      keyword?: string;
    },
  ) {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 50, 200);
    const skip = (page - 1) * pageSize;

    const where: any = { seriesId };
    if (query.rarity) {
      where.rarity = query.rarity;
    }
    if (query.keyword) {
      where.name = { contains: query.keyword, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.boxItem.findMany({
        where,
        orderBy: { seriesIndex: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.boxItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.formatItem(item)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(dto: CreateItemDto) {
    const series = await this.prisma.boxSeries.findUnique({
      where: { id: dto.seriesId },
    });
    if (!series) {
      throw new NotFoundException('系列不存在');
    }

    const existing = await this.prisma.boxItem.findUnique({
      where: { seriesId_seriesIndex: { seriesId: dto.seriesId, seriesIndex: dto.seriesIndex } },
    });
    if (existing) {
      throw new ConflictException('该系列下已有相同编号的卡片');
    }

    const item = await this.prisma.boxItem.create({
      data: {
        seriesId: dto.seriesId,
        name: dto.name,
        subtitle: dto.subtitle || null,
        emoji: dto.emoji,
        rarity: dto.rarity,
        imageUrl: dto.imageUrl || '',
        description: dto.description || null,
        seriesIndex: dto.seriesIndex,
      },
    });

    // Update series totalItems count
    await this.prisma.boxSeries.update({
      where: { id: dto.seriesId },
      data: { totalItems: { increment: 1 } },
    });

    return this.formatItem(item);
  }

  async update(id: string, dto: UpdateItemDto) {
    const item = await this.prisma.boxItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('卡片不存在');
    }

    const updated = await this.prisma.boxItem.update({
      where: { id },
      data: dto,
    });

    return this.formatItem(updated);
  }

  async delete(id: string) {
    const item = await this.prisma.boxItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('卡片不存在');
    }

    await this.prisma.boxItem.delete({ where: { id } });

    // Update series totalItems
    await this.prisma.boxSeries.update({
      where: { id: item.seriesId },
      data: { totalItems: { decrement: 1 } },
    });

    return { success: true };
  }

  private formatItem(item: any) {
    return {
      id: item.id,
      seriesId: item.seriesId,
      name: item.name,
      subtitle: item.subtitle || null,
      emoji: item.emoji,
      rarity: item.rarity,
      imageUrl: item.imageUrl || null,
      description: item.description || null,
      seriesIndex: item.seriesIndex,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
    };
  }
}
