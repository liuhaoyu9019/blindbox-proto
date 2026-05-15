import type { Serie } from '@/types'

export const mockSeries: Serie[] = [
  {
    id: 'forest-tales',
    name: '森林物语',
    emoji: '🌿',
    description: '漫步于神秘森林，邂逅林间精灵与古木守护者。',
    totalCards: 12,
    createdAt: '2025-01-01T00:00:00.000Z',
    cards: [
      { id: 'ft-01', seriesId: 'forest-tales', name: '林间鹿', subtitle: '晨雾', emoji: '🦌', rarity: 'common', description: '晨雾中轻盈跃过的小鹿，带来一天的希望。', seriesIndex: 1 },
      { id: 'ft-02', seriesId: 'forest-tales', name: '松果精灵', subtitle: null, emoji: '🐿️', rarity: 'common', description: '藏在松果堆里的小精灵，调皮又可爱。', seriesIndex: 2 },
      { id: 'ft-03', seriesId: 'forest-tales', name: '蘑菇伞', subtitle: '雨后', emoji: '🍄', rarity: 'common', description: '雨后森林里最鲜艳的小伞。', seriesIndex: 3 },
      { id: 'ft-04', seriesId: 'forest-tales', name: '溪流石', subtitle: null, emoji: '🪨', rarity: 'common', description: '溪水长年冲刷过的圆润卵石。', seriesIndex: 4 },
      { id: 'ft-05', seriesId: 'forest-tales', name: '萤火虫', subtitle: null, emoji: '✨', rarity: 'rare', description: '夏夜森林中闪烁的点点星光。', seriesIndex: 5 },
      { id: 'ft-06', seriesId: 'forest-tales', name: '树洞', subtitle: null, emoji: '🪵', rarity: 'rare', description: '古老橡树上的秘密树洞，藏着森林的回忆。', seriesIndex: 6 },
      { id: 'ft-07', seriesId: 'forest-tales', name: '猫头鹰', subtitle: '月夜', emoji: '🦉', rarity: 'rare', description: '月夜中静默守望的智慧之鸟。', seriesIndex: 7 },
      { id: 'ft-08', seriesId: 'forest-tales', name: '花仙子', subtitle: null, emoji: '🧚', rarity: 'epic', description: '从花朵中诞生的仙子，掌管森林的生机。', seriesIndex: 8 },
      { id: 'ft-09', seriesId: 'forest-tales', name: '古树', subtitle: '千年', emoji: '🌳', rarity: 'epic', description: '经历了千年的古树，是森林的灵魂。', seriesIndex: 9 },
      { id: 'ft-10', seriesId: 'forest-tales', name: '白狐', subtitle: '雪', emoji: '🦊', rarity: 'legendary', description: '雪域中行走的灵狐，传说中能带来好运。', seriesIndex: 10 },
      { id: 'ft-11', seriesId: 'forest-tales', name: '森林之心', subtitle: null, emoji: '💚', rarity: 'legendary', description: '森林的心脏，护佑着万物生灵。', seriesIndex: 11 },
      { id: 'ft-12', seriesId: 'forest-tales', name: '精灵王', subtitle: '翡翠', emoji: '👑', rarity: 'secret', description: '森林的最高统治者，翡翠王冠闪耀着不朽的光芒。', seriesIndex: 12 },
    ],
  },
  {
    id: 'ocean-echo',
    name: '深海回音',
    emoji: '🌊',
    description: '潜入蔚蓝深海，聆听古老海洋的神秘回音。',
    totalCards: 8,
    createdAt: '2025-02-01T00:00:00.000Z',
    cards: [
      { id: 'oe-01', seriesId: 'ocean-echo', name: '珊瑚', subtitle: null, emoji: '🪸', rarity: 'common', description: '海底最绚丽的珊瑚丛。', seriesIndex: 1 },
      { id: 'oe-02', seriesId: 'ocean-echo', name: '小丑鱼', subtitle: null, emoji: '🐠', rarity: 'common', description: '在海葵中穿梭的活泼小鱼。', seriesIndex: 2 },
      { id: 'oe-03', seriesId: 'ocean-echo', name: '海星', subtitle: null, emoji: '⭐', rarity: 'common', description: '静静趴在海底的五角明星。', seriesIndex: 3 },
      { id: 'oe-04', seriesId: 'ocean-echo', name: '水母', subtitle: '发光', emoji: '🪼', rarity: 'rare', description: '深海中发出幽蓝光芒的透明舞者。', seriesIndex: 4 },
      { id: 'oe-05', seriesId: 'ocean-echo', name: '海龟', subtitle: null, emoji: '🐢', rarity: 'rare', description: '悠然游弋的海洋长者。', seriesIndex: 5 },
      { id: 'oe-06', seriesId: 'ocean-echo', name: '海豚', subtitle: '跃', emoji: '🐬', rarity: 'epic', description: '破浪而出的蓝色精灵。', seriesIndex: 6 },
      { id: 'oe-07', seriesId: 'ocean-echo', name: '鲸鱼', subtitle: '歌', emoji: '🐋', rarity: 'legendary', description: '深海中的巨人，歌声穿越千里海域。', seriesIndex: 7 },
      { id: 'oe-08', seriesId: 'ocean-echo', name: '海神', subtitle: '三叉戟', emoji: '🔱', rarity: 'secret', description: '深海的统治者，手持三叉戟的远古海神。', seriesIndex: 8 },
    ],
  },
  {
    id: 'star-collection',
    name: '星空集',
    emoji: '🌌',
    description: '仰望无垠星空，收集银河中的每一颗星。',
    totalCards: 16,
    createdAt: '2025-03-01T00:00:00.000Z',
    cards: [
      { id: 'sc-01', seriesId: 'star-collection', name: '北极星', subtitle: null, emoji: '⭐', rarity: 'common', description: '夜空中最稳定的指引之星。', seriesIndex: 1 },
      { id: 'sc-02', seriesId: 'star-collection', name: '流星', subtitle: null, emoji: '☄️', rarity: 'common', description: '转瞬即逝的流光。', seriesIndex: 2 },
      { id: 'sc-03', seriesId: 'star-collection', name: '新月', subtitle: null, emoji: '🌙', rarity: 'common', description: '弯弯的月牙，夜晚的微笑。', seriesIndex: 3 },
      { id: 'sc-04', seriesId: 'star-collection', name: '星云', subtitle: null, emoji: '🌫️', rarity: 'common', description: '太空中梦幻的彩色云雾。', seriesIndex: 4 },
      { id: 'sc-05', seriesId: 'star-collection', name: '双子星', subtitle: null, emoji: '💫', rarity: 'rare', description: '相互环绕的两颗星，永不分离。', seriesIndex: 5 },
      { id: 'sc-06', seriesId: 'star-collection', name: '银河', subtitle: null, emoji: '🌌', rarity: 'rare', description: '横跨天际的璀璨星河。', seriesIndex: 6 },
      { id: 'sc-07', seriesId: 'star-collection', name: '猎户座', subtitle: null, emoji: '🔭', rarity: 'rare', description: '最壮观的冬季星座。', seriesIndex: 7 },
      { id: 'sc-08', seriesId: 'star-collection', name: '满月', subtitle: null, emoji: '🌕', rarity: 'rare', description: '圆满的明月，照亮整个夜空。', seriesIndex: 8 },
      { id: 'sc-09', seriesId: 'star-collection', name: '彗星', subtitle: null, emoji: '☄️', rarity: 'epic', description: '拖着长尾划过天际的访客。', seriesIndex: 9 },
      { id: 'sc-10', seriesId: 'star-collection', name: '北斗七星', subtitle: null, emoji: '🪐', rarity: 'epic', description: '天空中最著名的勺形星群。', seriesIndex: 10 },
      { id: 'sc-11', seriesId: 'star-collection', name: '日食', subtitle: null, emoji: '🌑', rarity: 'epic', description: '日月交汇的罕见天象。', seriesIndex: 11 },
      { id: 'sc-12', seriesId: 'star-collection', name: '极光', subtitle: null, emoji: '🌈', rarity: 'epic', description: '极地夜空中舞动的彩色光幕。', seriesIndex: 12 },
      { id: 'sc-13', seriesId: 'star-collection', name: '星海旅人', subtitle: '极光', emoji: '🪐', rarity: 'legendary', description: '在星海中游历的旅者，见证过无数奇迹。', seriesIndex: 13 },
      { id: 'sc-14', seriesId: 'star-collection', name: '超新星', subtitle: null, emoji: '💥', rarity: 'legendary', description: '恒星最后的壮丽绽放。', seriesIndex: 14 },
      { id: 'sc-15', seriesId: 'star-collection', name: '黑洞', subtitle: null, emoji: '🕳️', rarity: 'legendary', description: '吞噬一切的宇宙深渊。', seriesIndex: 15 },
      { id: 'sc-16', seriesId: 'star-collection', name: '创世之星', subtitle: '起源', emoji: '🌟', rarity: 'secret', description: '传说中创造宇宙的第一颗星，拥有无尽的力量。', seriesIndex: 16 },
    ],
  },
  {
    id: 'flower-garden',
    name: '花间集',
    emoji: '🌸',
    description: '穿行于花海之间，珍藏每一朵绽放的瞬间。',
    totalCards: 10,
    createdAt: '2025-04-01T00:00:00.000Z',
    cards: [
      { id: 'fg-01', seriesId: 'flower-garden', name: '玫瑰', subtitle: null, emoji: '🌹', rarity: 'common', description: '经典的爱情之花。', seriesIndex: 1 },
      { id: 'fg-02', seriesId: 'flower-garden', name: '向日葵', subtitle: null, emoji: '🌻', rarity: 'common', description: '永远追随阳光的灿烂花朵。', seriesIndex: 2 },
      { id: 'fg-03', seriesId: 'flower-garden', name: '樱花', subtitle: null, emoji: '🌸', rarity: 'common', description: '春日里纷纷扬扬的粉雪。', seriesIndex: 3 },
      { id: 'fg-04', seriesId: 'flower-garden', name: '薰衣草', subtitle: null, emoji: '💜', rarity: 'rare', description: '紫色花海中弥漫的宁静香气。', seriesIndex: 4 },
      { id: 'fg-05', seriesId: 'flower-garden', name: '莲花', subtitle: null, emoji: '🪷', rarity: 'rare', description: '出淤泥而不染的高洁之花。', seriesIndex: 5 },
      { id: 'fg-06', seriesId: 'flower-garden', name: '铃兰', subtitle: null, emoji: '🔔', rarity: 'rare', description: '串串白铃，传递幸福的密语。', seriesIndex: 6 },
      { id: 'fg-07', seriesId: 'flower-garden', name: '牡丹', subtitle: null, emoji: '🌺', rarity: 'epic', description: '花中之王，雍容华贵。', seriesIndex: 7 },
      { id: 'fg-08', seriesId: 'flower-garden', name: '昙花', subtitle: '夜', emoji: '🌙', rarity: 'epic', description: '月下美人，一夜绽放即凋零。', seriesIndex: 8 },
      { id: 'fg-09', seriesId: 'flower-garden', name: '雪莲', subtitle: null, emoji: '❄️', rarity: 'legendary', description: '雪峰之巅的圣洁之花，千年一开。', seriesIndex: 9 },
      { id: 'fg-10', seriesId: 'flower-garden', name: '永恒花', subtitle: '时光', emoji: '💐', rarity: 'secret', description: '超越时间的花，永远绽放，传说得到它的人将获得永恒的幸福。', seriesIndex: 10 },
    ],
  },
]

export function getSerieById(id: string): Serie | undefined {
  return mockSeries.find(s => s.id === id)
}

export function getAllSeries(): Serie[] {
  return mockSeries
}

export function getSerieProgress(seriesId: string, collectedIds: string[]): { collected: number; total: number } {
  const serie = getSerieById(seriesId)
  if (!serie) return { collected: 0, total: 0 }
  return {
    collected: serie.cards.filter(c => collectedIds.includes(c.id)).length,
    total: serie.totalCards,
  }
}
