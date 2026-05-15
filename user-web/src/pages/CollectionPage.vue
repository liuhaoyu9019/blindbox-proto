<template>
  <div class="collection-page">
    <NavBar title="我的收藏" :showBack="true" @back="goBack" />

    <div class="collection-content">
      <!-- Filter pills -->
      <div class="filter-bar">
        <button
          v-for="filter in filters"
          :key="filter.key"
          class="filter-pill"
          :class="{ active: activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-bar">
        <span class="stats-text">
          已收集：{{ filteredCollected.length }} / {{ filteredTotal }}
        </span>
        <span class="stats-trophy">
          🏆 {{ filteredRate }}%
        </span>
      </div>

      <!-- Grid -->
      <div v-if="filteredCards.length === 0" class="empty-state">
        <p>{{ getEmptyText }}</p>
      </div>

      <div v-else class="collection-grid">
        <CollectionItem
          v-for="item in filteredCards"
          :key="item.card.id"
          :card="item.card"
          :is-collected="item.collected"
          @click="showCardDetail(item.card)"
        />
      </div>
    </div>

    <!-- Card detail modal -->
    <div class="modal-overlay" v-if="detailCard" @click.self="detailCard = null">
      <div class="detail-modal">
        <div class="detail-emoji">{{ detailCard.emoji }}</div>
        <h3 class="detail-title">
          {{ detailCard.subtitle ? `${detailCard.name} · ${detailCard.subtitle}` : detailCard.name }}
        </h3>
        <p class="detail-rarity" :style="{ color: rarityColor(detailCard.rarity) }">
          {{ rarityLabel(detailCard.rarity) }}
        </p>
        <p class="detail-serie">系列：{{ getSerieName(detailCard.seriesId) }}</p>
        <div class="detail-description">
          <p>{{ detailCard.description || '暂无介绍' }}</p>
        </div>
        <button class="modal-close-btn" @click="detailCard = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { BlindBox, Rarity } from '@/types'
import { RARITY_CONFIG } from '@/types'
import { getAllSeries, getSerieById } from '@/mock/series'
import { useCollectionStore } from '@/stores/collection'
import NavBar from '@/components/NavBar.vue'
import CollectionItem from '@/components/CollectionItem.vue'

const router = useRouter()
const collectionStore = useCollectionStore()

const activeFilter = ref<Rarity | 'all'>('all')
const detailCard = ref<BlindBox | null>(null)

const filters = [
  { key: 'all', label: '全部' },
  { key: 'common', label: 'Common' },
  { key: 'rare', label: 'Rare' },
  { key: 'epic', label: 'Epic' },
  { key: 'legendary', label: 'Legendary' },
] as const

// All cards from all series
const allCards = computed(() => {
  const cards: { card: BlindBox; collected: boolean; serieName: string }[] = []
  for (const serie of getAllSeries()) {
    for (const card of serie.cards) {
      cards.push({
        card,
        collected: collectionStore.isCollected(card.id),
        serieName: serie.name,
      })
    }
  }
  return cards
})

const filteredCards = computed(() => {
  return allCards.value.filter(item => {
    if (activeFilter.value === 'all') return true
    return item.card.rarity === activeFilter.value
  })
})

const filteredCollected = computed(() => filteredCards.value.filter(c => c.collected))

const filteredTotal = computed(() => filteredCards.value.length)

const filteredRate = computed(() => {
  if (filteredTotal.value === 0) return 0
  return Math.round((filteredCollected.value.length / filteredTotal.value) * 100)
})

const getEmptyText = computed(() => {
  if (activeFilter.value === 'all') return '还没有收集到卡片'
  const label = filters.find(f => f.key === activeFilter.value)?.label || ''
  return `该稀有度暂无卡片`
})

function getSerieName(seriesId: string): string {
  const serie = getSerieById(seriesId)
  return serie?.name || ''
}

function rarityColor(rarity: string): string {
  return RARITY_CONFIG[rarity as Rarity]?.borderColor || '#D4C9B8'
}

function rarityLabel(rarity: string): string {
  return `稀有度：${RARITY_CONFIG[rarity as Rarity]?.label || '普通'}`
}

function showCardDetail(card: BlindBox) {
  if (!collectionStore.isCollected(card.id)) return
  detailCard.value = card
}

function goBack() {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.collection-page {
  min-height: 100vh;
  padding-bottom: var(--spacing-xl);
}

.collection-content {
  padding: 0 var(--spacing-lg);
}

/* Filter bar */
.filter-bar {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding: var(--spacing-sm) 0 var(--spacing-md);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.filter-bar::-webkit-scrollbar {
  display: none;
}
.filter-pill {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-caption);
  font-weight: 500;
  background: var(--color-white);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-divider);
  transition: all var(--transition-fast);
}
.filter-pill.active {
  background: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
}
.filter-pill:active {
  transform: scale(0.95);
}

/* Stats */
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}
.stats-text {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}
.stats-trophy {
  font-size: var(--font-size-caption);
  font-weight: 600;
}

/* Grid */
.collection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

/* Detail modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-lg);
}
.detail-modal {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 320px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  text-align: center;
}
.detail-emoji {
  font-size: 56px;
  margin-bottom: var(--spacing-md);
}
.detail-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}
.detail-rarity {
  font-size: var(--font-size-caption);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}
.detail-serie {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}
.detail-description {
  background: var(--bg-page);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  text-align: left;
}
.detail-description p {
  font-size: var(--font-size-caption);
  color: var(--color-text);
  line-height: 1.6;
}
.modal-close-btn {
  width: 100%;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-white);
  font-size: var(--font-size-body);
  font-weight: 500;
}
</style>
