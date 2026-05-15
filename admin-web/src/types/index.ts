// ====== Common ======
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'secret';

export interface ApiSuccess<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ====== Admin ======
export interface AdminInfo {
  id: string;
  username: string;
  avatar: string | null;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminInfo;
}

// ====== Series ======
export interface Series {
  id: string;
  name: string;
  emoji: string;
  description: string;
  totalCards: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeriesListItem extends Series {
  itemCount: number;
}

export interface CreateSeriesRequest {
  name: string;
  emoji: string;
  description: string;
}

export interface UpdateSeriesRequest {
  name?: string;
  emoji?: string;
  description?: string;
}

// ====== Items (Cards) ======
export interface Item {
  id: string;
  seriesId: string;
  name: string;
  subtitle: string | null;
  emoji: string;
  rarity: Rarity;
  imageUrl: string | null;
  description: string | null;
  seriesIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  seriesId: string;
  name: string;
  subtitle?: string;
  emoji: string;
  rarity: Rarity;
  imageUrl?: string;
  description?: string;
  seriesIndex: number;
}

export interface UpdateItemRequest {
  name?: string;
  subtitle?: string;
  emoji?: string;
  rarity?: Rarity;
  imageUrl?: string;
  description?: string;
  seriesIndex?: number;
}

export interface UploadImageResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// ====== Users ======
export interface UserListItem {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  isBanned: boolean;
  drawCount: number;
  collectionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail {
  user: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    totalDraws: number;
    uniqueCards: number;
    totalCards: number;
    totalDuplicates: number;
    rarityDistribution: Record<Rarity, number>;
  };
  recentDraws: Array<{
    item: Item;
    drawnAt: string;
  }>;
  collections: Array<{
    item: Item;
    count: number;
    acquiredAt: string;
  }>;
}

export interface BanUserResponse {
  id: string;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
}

// ====== Stats ======
export interface StatsResponse {
  overview: {
    totalUsers: number;
    todayNewUsers: number;
    totalDraws: number;
    todayDraws: number;
    totalSeries: number;
    totalItems: number;
    todayShares: number;
  };
  rarityDistribution: Array<{
    rarity: Rarity;
    count: number;
  }>;
  topSeries: Array<{
    id: string;
    name: string;
    drawCount: number;
    collectionRate: number;
  }>;
  recentActivities: Array<{
    type: 'draw' | 'register' | 'share';
    user: { id: string; nickname: string };
    detail: string;
    timestamp: string;
  }>;
}

// ====== Rarity Config ======
export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; emoji: string }> = {
  common: { label: '普通', color: '#909399', emoji: '⚪' },
  rare: { label: '稀有', color: '#409EFF', emoji: '🔵' },
  epic: { label: '史诗', color: '#9B59B6', emoji: '🟣' },
  legendary: { label: '传说', color: '#E6A23C', emoji: '🟠' },
  secret: { label: '隐藏', color: '#F56C6C', emoji: '🔴' },
};
