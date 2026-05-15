import { PrismaClient, Rarity } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPlainPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminPassword = await bcrypt.hash(adminPlainPassword, 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      nickname: '管理员',
      role: 'superadmin',
    },
  });
  console.log(`✓ Admin user created (admin / ${adminPlainPassword})`);

  // Create series
  const forestSeries = await prisma.boxSeries.upsert({
    where: { name: '森林物语' },
    update: {},
    create: {
      name: '森林物语',
      emoji: '🌿',
      description: '探索神秘森林中的奇妙生物，每个角色都藏着一个故事。',
      totalItems: 8,
      isActive: true,
    },
  });

  const oceanSeries = await prisma.boxSeries.upsert({
    where: { name: '深海秘境' },
    update: {},
    create: {
      name: '深海秘境',
      emoji: '🌊',
      description: '潜入深蓝海洋，发现隐藏在浪花之下的奇幻生物。',
      totalItems: 8,
      isActive: true,
    },
  });

  const starSeries = await prisma.boxSeries.upsert({
    where: { name: '星海旅人' },
    update: {},
    create: {
      name: '星海旅人',
      emoji: '⭐',
      description: '穿越星海，遇见来自不同星系的星际旅人。',
      totalItems: 8,
      isActive: true,
    },
  });

  const candySeries = await prisma.boxSeries.upsert({
    where: { name: '糖果物语' },
    update: {},
    create: {
      name: '糖果物语',
      emoji: '🍬',
      description: '甜美的糖果世界，每一口都是惊喜。',
      totalItems: 8,
      isActive: true,
    },
  });

  console.log('✓ Series created');

  // Forest Series items
  const forestItems = [
    { name: '小蘑菇', emoji: '🍄', rarity: 'COMMON' as Rarity, seriesIndex: 1 },
    { name: '落叶精灵', emoji: '🍂', rarity: 'COMMON' as Rarity, seriesIndex: 2 },
    { name: '树梢小鸟', emoji: '🐦', rarity: 'COMMON' as Rarity, seriesIndex: 3 },
    { name: '溪边蛙', emoji: '🐸', rarity: 'RARE' as Rarity, seriesIndex: 4 },
    { name: '林间鹿', emoji: '🦌', rarity: 'RARE' as Rarity, seriesIndex: 5 },
    { name: '夜光蝶', emoji: '🦋', rarity: 'EPIC' as Rarity, seriesIndex: 6 },
    { name: '森林守护者', emoji: '🌳', rarity: 'LEGENDARY' as Rarity, seriesIndex: 7 },
    { name: '幻影狐', emoji: '🦊', rarity: 'SECRET' as Rarity, seriesIndex: 8 },
  ];

  for (const item of forestItems) {
    await prisma.boxItem.upsert({
      where: { seriesId_seriesIndex: { seriesId: forestSeries.id, seriesIndex: item.seriesIndex } },
      update: {},
      create: {
        seriesId: forestSeries.id,
        ...item,
        imageUrl: '',
        description: `来自「森林物语」系列的「${item.name}」，每一个森林生物都有自己的故事。`,
      },
    });
  }

  // Ocean Series items
  const oceanItems = [
    { name: '小丑鱼', emoji: '🐠', rarity: 'COMMON' as Rarity, seriesIndex: 1 },
    { name: '海星', emoji: '⭐', rarity: 'COMMON' as Rarity, seriesIndex: 2 },
    { name: '小海龟', emoji: '🐢', rarity: 'COMMON' as Rarity, seriesIndex: 3 },
    { name: '海马', emoji: '🐴', rarity: 'RARE' as Rarity, seriesIndex: 4 },
    { name: '水母', emoji: '🪼', rarity: 'RARE' as Rarity, seriesIndex: 5 },
    { name: '鲸鱼', emoji: '🐋', rarity: 'EPIC' as Rarity, seriesIndex: 6 },
    { name: '深海龙王', emoji: '🐉', rarity: 'LEGENDARY' as Rarity, seriesIndex: 7 },
    { name: '人鱼公主', emoji: '🧜‍♀️', rarity: 'SECRET' as Rarity, seriesIndex: 8 },
  ];

  for (const item of oceanItems) {
    await prisma.boxItem.upsert({
      where: { seriesId_seriesIndex: { seriesId: oceanSeries.id, seriesIndex: item.seriesIndex } },
      update: {},
      create: {
        seriesId: oceanSeries.id,
        ...item,
        imageUrl: '',
        description: `来自「深海秘境」系列的「${item.name}」，深海之中藏着无穷的秘密。`,
      },
    });
  }

  // Star Series items
  const starItems = [
    { name: '小星星', emoji: '✨', rarity: 'COMMON' as Rarity, seriesIndex: 1 },
    { name: '流星', emoji: '🌠', rarity: 'COMMON' as Rarity, seriesIndex: 2 },
    { name: '卫星', emoji: '🛰️', rarity: 'COMMON' as Rarity, seriesIndex: 3 },
    { name: '宇航猫', emoji: '🐱', rarity: 'RARE' as Rarity, seriesIndex: 4 },
    { name: '星云', emoji: '🌌', rarity: 'RARE' as Rarity, seriesIndex: 5 },
    { name: '黑洞', emoji: '🕳️', rarity: 'EPIC' as Rarity, seriesIndex: 6 },
    { name: '星舰船长', emoji: '🚀', rarity: 'LEGENDARY' as Rarity, seriesIndex: 7 },
    { name: '外星来客', emoji: '🛸', rarity: 'SECRET' as Rarity, seriesIndex: 8 },
  ];

  for (const item of starItems) {
    await prisma.boxItem.upsert({
      where: { seriesId_seriesIndex: { seriesId: starSeries.id, seriesIndex: item.seriesIndex } },
      update: {},
      create: {
        seriesId: starSeries.id,
        ...item,
        imageUrl: '',
        description: `来自「星海旅人」系列的「${item.name}」，星辰大海是他们的归宿。`,
      },
    });
  }

  // Candy Series items
  const candyItems = [
    { name: '棒棒糖', emoji: '🍭', rarity: 'COMMON' as Rarity, seriesIndex: 1 },
    { name: '棉花糖', emoji: '☁️', rarity: 'COMMON' as Rarity, seriesIndex: 2 },
    { name: '小熊软糖', emoji: '🧸', rarity: 'COMMON' as Rarity, seriesIndex: 3 },
    { name: '巧克力', emoji: '🍫', rarity: 'RARE' as Rarity, seriesIndex: 4 },
    { name: '马卡龙', emoji: '🟣', rarity: 'RARE' as Rarity, seriesIndex: 5 },
    { name: '蛋糕公主', emoji: '🎂', rarity: 'EPIC' as Rarity, seriesIndex: 6 },
    { name: '糖果女王', emoji: '👑', rarity: 'LEGENDARY' as Rarity, seriesIndex: 7 },
    { name: '梦幻冰淇淋', emoji: '🍦', rarity: 'SECRET' as Rarity, seriesIndex: 8 },
  ];

  for (const item of candyItems) {
    await prisma.boxItem.upsert({
      where: { seriesId_seriesIndex: { seriesId: candySeries.id, seriesIndex: item.seriesIndex } },
      update: {},
      create: {
        seriesId: candySeries.id,
        ...item,
        imageUrl: '',
        description: `来自「糖果物语」系列的「${item.name}」，甜蜜的诱惑无人能挡。`,
      },
    });
  }

  console.log('✓ Items created');
  console.log('');
  console.log('Seed completed!');
  console.log(`Admin login: admin / ${adminPlainPassword}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
