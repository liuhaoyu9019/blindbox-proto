import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class SeriesService {
  constructor(private prisma: PrismaService) {}

  async list(query: { page?: number; pageSize?: number }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where = { isActive: true };

    const [series, total] = await Promise.all([
      this.prisma.boxSeries.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.boxSeries.count({ where }),
    ]);

    return {
      items: series.map((s) => ({
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        description: s.description || '',
        totalCards: s.totalItems,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async detail(id: string) {
    const series = await this.prisma.boxSeries.findUnique({
      where: { id },
      include: {
        items: { orderBy: { seriesIndex: 'asc' } },
      },
    });
    if (!series || !series.isActive) {
      throw new NotFoundException('系列不存在或已下架');
    }

    const items = series.items.map((item) => ({
      id: item.id,
      seriesId: item.seriesId,
      name: item.name,
      subtitle: item.subtitle || null,
      emoji: item.emoji,
      rarity: item.rarity,
      imageUrl: item.imageUrl || null,
      description: item.description || null,
      seriesIndex: item.seriesIndex,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return {
      series: {
        id: series.id,
        name: series.name,
        emoji: series.emoji,
        description: series.description || '',
        totalCards: series.totalItems,
        createdAt: series.createdAt.toISOString(),
        updatedAt: series.updatedAt.toISOString(),
        items,
      },
    };
  }
}
