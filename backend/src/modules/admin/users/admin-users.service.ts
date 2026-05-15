import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async list(query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    isBanned?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.keyword) {
      where.nickname = { contains: query.keyword, mode: 'insensitive' };
    }
    if (query.isBanned !== undefined) {
      where.isBanned = query.isBanned;
    }

    const [users, total] = await Promise.all([
      this.prisma.anonymousUser.findMany({
        where,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.anonymousUser.count({ where }),
    ]);

    // Get draw counts and collection counts for each user
    const items = await Promise.all(
      users.map(async (user) => {
        const [drawCount, collectionCount] = await Promise.all([
          this.prisma.drawRecord.count({ where: { userId: user.id } }),
          this.prisma.collection.count({ where: { userId: user.id } }),
        ]);
        return {
          id: user.id,
          nickname: user.fingerprint.substring(0, 16),
          avatarUrl: null,
          isBanned: user.isBanned,
          drawCount,
          collectionCount,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.createdAt.toISOString(),
        };
      }),
    );

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async detail(id: string) {
    const user = await this.prisma.anonymousUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const [totalDraws, uniqueCards, totalCards, recentDraws, collections] =
      await Promise.all([
        this.prisma.drawRecord.count({ where: { userId: id } }),
        this.prisma.collection.count({ where: { userId: id } }),
        this.prisma.boxItem.count(),
        this.prisma.drawRecord.findMany({
          where: { userId: id },
          orderBy: { drawDate: 'desc' },
          take: 10,
          include: { item: true },
        }),
        this.prisma.collection.findMany({
          where: { userId: id },
          include: { item: true },
        }),
      ]);

    // Calculate rarity distribution
    const rarityDistribution: Record<string, number> = {
      COMMON: 0,
      RARE: 0,
      EPIC: 0,
      LEGENDARY: 0,
      SECRET: 0,
    };
    for (const coll of collections) {
      rarityDistribution[coll.item.rarity] =
        (rarityDistribution[coll.item.rarity] || 0) + coll.count;
    }

    return {
      user: {
        id: user.id,
        nickname: user.fingerprint.substring(0, 16),
        avatarUrl: null,
        isBanned: user.isBanned,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.createdAt.toISOString(),
      },
      stats: {
        totalDraws,
        uniqueCards,
        totalCards,
        totalDuplicates: Math.max(0, totalDraws - uniqueCards),
        rarityDistribution,
      },
      recentDraws: recentDraws.map((r) => ({
        item: this.formatItem(r.item),
        drawnAt: r.drawDate.toISOString(),
      })),
      collections: collections.map((c) => ({
        item: this.formatItem(c.item),
        count: c.count,
        acquiredAt: c.createdAt.toISOString(),
      })),
    };
  }

  async ban(id: string, dto: { isBanned: boolean; reason?: string }) {
    if (dto.isBanned && !dto.reason) {
      throw new BadRequestException('封禁时请提供原因');
    }

    const user = await this.prisma.anonymousUser.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.prisma.anonymousUser.update({
      where: { id },
      data: { isBanned: dto.isBanned },
    });

    return {
      id: user.id,
      isBanned: dto.isBanned,
      bannedAt: dto.isBanned ? new Date().toISOString() : null,
      banReason: dto.reason || null,
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
