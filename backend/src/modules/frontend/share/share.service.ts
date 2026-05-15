import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class ShareService {
  constructor(private prisma: PrismaService) {}

  async create(fingerprint: string, cardId: string, platform?: string) {
    // Find or create user
    let user = await this.prisma.anonymousUser.findUnique({
      where: { fingerprint },
    });

    if (!user) {
      user = await this.prisma.anonymousUser.create({
        data: { fingerprint },
      });
    }

    // Verify card exists
    const item = await this.prisma.boxItem.findUnique({ where: { id: cardId } });
    if (!item) {
      throw new NotFoundException('卡片不存在');
    }

    // Create share record
    const share = await this.prisma.shareRecord.create({
      data: {
        userId: user.id,
        itemId: cardId,
        channel: platform || 'unknown',
      },
    });

    return {
      id: share.id,
      shareUrl: `/share/${share.id}`,
      createdAt: share.shareDate.toISOString(),
    };
  }
}
