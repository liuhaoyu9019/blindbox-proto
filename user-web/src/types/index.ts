export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'secret'

export interface Serie {
  id: string
  name: string
  emoji: string
  description: string
  totalCards: number
  cards: BlindBox[]
  createdAt: string
}

export interface BlindBox {
  id: string
  seriesId: string
  name: string
  subtitle: string | null
  emoji: string
  rarity: Rarity
  description: string | null
  seriesIndex: number
}

export interface Collection {
  cardId: string
  seriesId: string
  acquiredAt: string
  count: number
}

export interface UserCollectionState {
  collections: Collection[]
  drawCounters: Record<string, number>
}

export interface RarityConfig {
  label: string
  borderColor: string
  bgColor: string
  gradient?: string
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    label: '普通',
    borderColor: '#D4C9B8',
    bgColor: '#FAFAF7',
  },
  rare: {
    label: '稀有',
    borderColor: '#9FB8D4',
    bgColor: '#F5F8FC',
  },
  epic: {
    label: '史诗',
    borderColor: '#B8A8D8',
    bgColor: '#F8F5FC',
  },
  legendary: {
    label: '传说',
    borderColor: '#E8C87A',
    bgColor: '#FFFBF5',
  },
  secret: {
    label: '隐藏',
    borderColor: '#E8C87A',
    bgColor: '#FFFDF8',
    gradient: 'linear-gradient(135deg, #E8C87A, #F5E6C8, #E8C87A)',
  },
}
