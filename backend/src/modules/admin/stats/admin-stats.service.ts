import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      todayNewUsers,
      totalDraws,
      todayDraws,
      totalSeries,
      totalItems,
      todayShares,
      rarityItems,
      drawRecords,
    ] = await Promise.all([
      this.prisma.anonymousUser.count(),
      this.prisma.anonymousUser.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.drawRecord.count(),
      this.prisma.drawRecord.count({
        where: { drawDate: { gte: todayStart } },
      }),
      this.prisma.boxSeries.count({ where: { isActive: true } }),
      this.prisma.boxItem.count(),
      this.prisma.shareRecord.count({
        where: { shareDate: { gte: todayStart } },
      }),
      this.prisma.boxItem.groupBy({
        by: ['rarity'],
        _count: { id: true },
      }),
      this.prisma.drawRecord.findMany({
        take: 20,
        orderBy: { drawDate: 'desc' },
        include: {
          user: { select: { id: true, fingerprint: true } },
          item: { select: { name: true, rarity: true } },
        },
      }),
    ]);

    // Rarity distribution for items
    const rarityDistribution = rarityItems.map((r) => ({
      rarity: r.rarity,
      count: r._count.id,
    }));

    // Get top series by draw count
    const seriesDrawCounts = await this.prisma.drawRecord.groupBy({
      by: ['itemId'],
      _count: { id: true },
    });

    const seriesMap = new Map<string, number>();
    const itemSeriesMap = new Map<string, string>();

    const allItems = await this.prisma.boxItem.findMany({
      select: { id: true, seriesId: true },
    });
    for (const item of allItems) {
      itemSeriesMap.set(item.id, item.seriesId);
    }

    for (const record of seriesDrawCounts) {
      const sid = itemSeriesMap.get(record.itemId);
      if (sid) {
        seriesMap.set(sid, (seriesMap.get(sid) || 0) + record._count.id);
      }
    }

    const topSeriesData = [...seriesMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topSeries = await Promise.all(
      topSeriesData.map(async ([sid, drawCount]) => {
        const series = await this.prisma.boxSeries.findUnique({
          where: { id: sid },
          select: { id: true, name: true, totalItems: true },
        });
        return {
          id: sid,
          name: series?.name || 'Unknown',
          drawCount,
          collectionRate: 0, // simplified
        };
      }),
    );

    // Recent activities
    const recentActivities = drawRecords.map((r) => ({
      type: 'draw' as const,
      user: {
        id: r.user.id,
        nickname: r.user.fingerprint.substring(0, 16),
      },
      detail: `抽到 ${r.item.name}`,
      timestamp: r.drawDate.toISOString(),
    }));

    return {
      overview: {
        totalUsers,
        todayNewUsers,
        totalDraws,
        todayDraws,
        totalSeries,
        totalItems,
        todayShares,
      },
      rarityDistribution,
      topSeries,
      recentActivities,
    };
  }
}
