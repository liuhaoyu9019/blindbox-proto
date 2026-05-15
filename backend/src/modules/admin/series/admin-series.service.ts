import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

@Injectable()
export class AdminSeriesService {
  constructor(private prisma: PrismaService) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.keyword) {
      where.name = { contains: query.keyword, mode: 'insensitive' };
    }

    const orderBy: any = {};
    const sortField = query.sortBy === 'name' ? 'name' : 'createdAt';
    orderBy[sortField] = query.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      this.prisma.boxSeries.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: { _count: { select: { items: true } } },
      }),
      this.prisma.boxSeries.count({ where }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        description: s.description || '',
        totalCards: s.totalItems,
        itemCount: s._count.items,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(dto: CreateSeriesDto) {
    const existing = await this.prisma.boxSeries.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('系列名称已存在');
    }

    const series = await this.prisma.boxSeries.create({
      data: {
        name: dto.name,
        emoji: dto.emoji,
        description: dto.description || null,
      },
    });

    return this.formatSeries(series);
  }

  async update(id: string, dto: UpdateSeriesDto) {
    const series = await this.prisma.boxSeries.findUnique({ where: { id } });
    if (!series) {
      throw new NotFoundException('系列不存在');
    }

    if (dto.name) {
      const existing = await this.prisma.boxSeries.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('系列名称已存在');
      }
    }

    const updated = await this.prisma.boxSeries.update({
      where: { id },
      data: dto,
    });

    return this.formatSeries(updated);
  }

  async delete(id: string) {
    const series = await this.prisma.boxSeries.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!series) {
      throw new NotFoundException('系列不存在');
    }
    if (series._count.items > 0) {
      throw new ConflictException('系列下仍有卡片，无法删除');
    }

    await this.prisma.boxSeries.delete({ where: { id } });
    return { success: true };
  }

  private formatSeries(s: any) {
    return {
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      description: s.description || '',
      totalCards: s.totalItems,
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
      updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
    };
  }
}
