import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Rarity } from '@prisma/client';

@Injectable()
export class DrawService {
  constructor(private prisma: PrismaService) {}

  /**
   * Execute a blind box draw for an anonymous user
   */
  async execute(seriesId: string, fingerprint: string) {
    // Find or create anonymous user
    let user = await this.prisma.anonymousUser.findUnique({
      where: { fingerprint },
    });

    if (!user) {
      user = await this.prisma.anonymousUser.create({
        data: { fingerprint },
      });
    }

    if (user.isBanned) {
      throw new HttpException('账号已被封禁', HttpStatus.FORBIDDEN);
    }

    // Verify series exists
    const series = await this.prisma.boxSeries.findUnique({
      where: { id: seriesId },
    });
    if (!series || !series.isActive) {
      throw new NotFoundException('系列不存在或已下架');
    }

    // Get all items in this series
    const allItems = await this.prisma.boxItem.findMany({
      where: { seriesId: seriesId },
    });

    if (allItems.length === 0) {
      throw new NotFoundException('该系列暂无卡片');
    }

    // Get or create draw counter for this user+series
    let drawCounter = await this.prisma.drawCounter.findUnique({
      where: { userId_seriesId: { userId: user.id, seriesId } },
    });

    if (!drawCounter) {
      drawCounter = await this.prisma.drawCounter.create({
        data: { userId: user.id, seriesId, count: 0 },
      });
    }

    const currentDrawCount = drawCounter.count;

    // Determine the rarity based on pity algorithm
    const drawnRarity = this.calculateRarity(currentDrawCount);

    // Filter items by the drawn rarity
    let candidates = allItems.filter((item) => item.rarity === drawnRarity);

    // If no items of that rarity, fall back to a lower rarity
    if (candidates.length === 0) {
      const rarities: Rarity[] = ['SECRET', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'];
      for (const r of rarities) {
        candidates = allItems.filter((item) => item.rarity === r);
        if (candidates.length > 0) break;
      }
    }

    // Pick a random item from candidates
    const drawnItem = candidates[Math.floor(Math.random() * candidates.length)];

    // Check if user already has this card
    const existingCollection = await this.prisma.collection.findUnique({
      where: { userId_itemId: { userId: user.id, itemId: drawnItem.id } },
    });

    const isNew = !existingCollection;
    const isDuplicate = !!existingCollection;

    // Upsert collection
    if (existingCollection) {
      await this.prisma.collection.update({
        where: { id: existingCollection.id },
        data: { count: { increment: 1 } },
      });
    } else {
      await this.prisma.collection.create({
        data: { userId: user.id, itemId: drawnItem.id },
      });
    }

    // Create draw record
    await this.prisma.drawRecord.create({
      data: { userId: user.id, itemId: drawnItem.id },
    });

    // Update draw counter
    // If hard pity triggered (drawCount >= 60 before this draw), reset to 0
    if (currentDrawCount >= 60) {
      await this.prisma.drawCounter.update({
        where: { id: drawCounter.id },
        data: { count: 0 },
      });
    } else {
      await this.prisma.drawCounter.update({
        where: { id: drawCounter.id },
        data: { count: currentDrawCount + 1 },
      });
    }

    // Update user last active
    await this.prisma.anonymousUser.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Count collection stats for this series
    const collectedCount = await this.prisma.collection.count({
      where: {
        userId: user.id,
        item: { seriesId: seriesId },
      },
    });

    const pityCount = Math.max(0, 60 - (currentDrawCount + 1));

    return {
      result: {
        item: this.formatItem(drawnItem),
        isNew,
        isDuplicate,
        duplicateCount: (existingCollection?.count || 0) + 1,
      },
      progress: {
        seriesId: seriesId,
        collectedCount,
        totalCount: series.totalItems,
        drawCount: currentDrawCount + 1,
        pityCount,
      },
    };
  }

  /**
   * Pity mechanism algorithm
   * - Hard pity: at 60 draws without Legendary, force Legendary
   * - Soft pity: after 40 draws, Legendary probability increases by 3% per draw
   * - Secret: always 1%, not affected by pity
   */
  private calculateRarity(drawCount: number): Rarity {
    // Secret is always 1%, check first
    if (Math.random() < 0.01) {
      return 'SECRET';
    }

    // Hard pity: guaranteed Legendary at 60
    if (drawCount >= 60) {
      return 'LEGENDARY';
    }

    // Base rates
    let commonRate = 0.55;
    let rareRate = 0.25;
    let epicRate = 0.12;
    let legendaryRate = 0.07;

    // Soft pity: after 40 draws, Legendary rate increases
    if (drawCount > 40) {
      const bonus = (drawCount - 40) * 0.03;
      legendaryRate += bonus;
      commonRate = Math.max(0, commonRate - bonus);
    }

    // Normalize total to 1.0 (since we removed secret's 1%)
    const total = commonRate + rareRate + epicRate + legendaryRate;
    const normalizedTotal = total > 0 ? total : 1;

    const rand = Math.random() * normalizedTotal;
    let cumulative = 0;

    cumulative += commonRate;
    if (rand < cumulative) return 'COMMON';

    cumulative += rareRate;
    if (rand < cumulative) return 'RARE';

    cumulative += epicRate;
    if (rand < cumulative) return 'EPIC';

    return 'LEGENDARY';
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
