import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Rarity } from '@prisma/client';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async list(
    fingerprint: string,
    query: {
      page?: number;
      pageSize?: number;
      seriesId?: string;
      rarity?: Rarity;
      isCollected?: boolean;
    },
  ) {
    const user = await this.prisma.anonymousUser.findUnique({
      where: { fingerprint },
    });

    if (!user) {
      // New user, return empty collection
      return this.emptyResponse(query.seriesId);
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 50;
    const skip = (page - 1) * pageSize;

    // Build the base where clause for collection items
    const collWhere: any = { userId: user.id };

    // Get user's collected items
    const collections = await this.prisma.collection.findMany({
      where: collWhere,
      include: { item: true },
    });

    const collectedItemIds = new Set(collections.map((c) => c.itemId));
    const collectedMap = new Map(collections.map((c) => [c.itemId, c]));

    // If filtering by series
    const seriesFilter: any = {};
    if (query.seriesId) {
      seriesFilter.seriesId = query.seriesId;
    }
    if (query.rarity) {
      seriesFilter.rarity = query.rarity;
    }

    // Get all items matching filter
    const allItems = await this.prisma.boxItem.findMany({
      where: { ...seriesFilter },
      orderBy: { seriesIndex: 'asc' },
    });

    // Build response items
    let items = allItems.map((item) => {
      const coll = collectedMap.get(item.id) as typeof collections[0] | undefined;
      return {
        item: this.formatItem(item),
        count: coll?.count || 0,
        acquiredAt: coll?.createdAt?.toISOString() || null,
        isCollected: collectedItemIds.has(item.id),
      };
    });

    // Apply isCollected filter
    if (query.isCollected !== undefined) {
      items = items.filter((i) => i.isCollected === query.isCollected);
    }

    const total = items.length;
    const paginatedItems = items.slice(skip, skip + pageSize);

    // Get stats
    const allSeriesItems = await this.prisma.boxItem.findMany({
      where: query.seriesId ? { seriesId: query.seriesId } : {},
    });

    const totalCards = allSeriesItems.length;
    const collectedCards = allSeriesItems.filter((i) => collectedItemIds.has(i.id)).length;

    // Rarity distribution
    const rarityDistribution: Record<string, { owned: number; total: number }> = {
      COMMON: { owned: 0, total: 0 },
      RARE: { owned: 0, total: 0 },
      EPIC: { owned: 0, total: 0 },
      LEGENDARY: { owned: 0, total: 0 },
      SECRET: { owned: 0, total: 0 },
    };

    for (const item of allSeriesItems) {
      rarityDistribution[item.rarity].total++;
      if (collectedItemIds.has(item.id)) {
        rarityDistribution[item.rarity].owned++;
      }
    }

    return {
      items: paginatedItems,
      stats: {
        totalCards,
        collectedCards,
        collectionRate: totalCards > 0 ? Math.round((collectedCards / totalCards) * 100) : 0,
        rarityDistribution,
      },
    };
  }

  async check(fingerprint: string, cardIds: string[]) {
    const user = await this.prisma.anonymousUser.findUnique({
      where: { fingerprint },
    });

    if (!user) {
      const results: Record<string, { isCollected: boolean; count: number }> = {};
      for (const id of cardIds) {
        results[id] = { isCollected: false, count: 0 };
      }
      return { results };
    }

    const collections = await this.prisma.collection.findMany({
      where: {
        userId: user.id,
        itemId: { in: cardIds },
      },
    });

    const results: Record<string, { isCollected: boolean; count: number }> = {};
    for (const id of cardIds) {
      const coll = collections.find((c) => c.itemId === id);
      results[id] = {
        isCollected: !!coll,
        count: coll?.count || 0,
      };
    }

    return { results };
  }

  private async emptyResponse(seriesId?: string) {
    const allItems = await this.prisma.boxItem.findMany({
      where: seriesId ? { seriesId: seriesId } : {},
      orderBy: { seriesIndex: 'asc' },
    });

    const totalCards = allItems.length;
    const rarityDistribution: Record<string, { owned: number; total: number }> = {
      COMMON: { owned: 0, total: 0 },
      RARE: { owned: 0, total: 0 },
      EPIC: { owned: 0, total: 0 },
      LEGENDARY: { owned: 0, total: 0 },
      SECRET: { owned: 0, total: 0 },
    };

    for (const item of allItems) {
      rarityDistribution[item.rarity].total++;
    }

    return {
      items: allItems.map((item) => ({
        item: this.formatItem(item),
        count: 0,
        acquiredAt: null,
        isCollected: false,
      })),
      stats: {
        totalCards,
        collectedCards: 0,
        collectionRate: 0,
        rarityDistribution,
      },
    };
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
