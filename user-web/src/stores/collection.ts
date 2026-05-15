import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Collection } from '@/types'
import { getAllSeries } from '@/mock/series'
import { fetchCollectionStats } from '@/api'

const STORAGE_KEY = 'blindbox_collections'

function loadFromStorage(): Collection[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(collections: Collection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
}

export const useCollectionStore = defineStore('collection', () => {
  const collections = ref<Collection[]>(loadFromStorage())

  const collectedCardIds = computed(() => collections.value.map(c => c.cardId))
  const collectedCardSet = computed(() => new Set(collectedCardIds.value))

  const collectionMap = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const c of collections.value) {
      map[c.cardId] = c.count
    }
    return map
  })

  const totalAllCards = computed(() => {
    return getAllSeries().reduce((sum, s) => sum + s.totalCards, 0)
  })

  const totalCollected = computed(() => collections.value.length)

  const collectionRate = computed(() => {
    const total = totalAllCards.value
    return total > 0 ? Math.round((totalCollected.value / total) * 100) : 0
  })

  const seriesProgressMap = computed(() => {
    const map: Record<string, { collected: number; total: number }> = {}
    for (const serie of getAllSeries()) {
      const collected = serie.cards.filter(c => collectedCardSet.value.has(c.id)).length
      map[serie.id] = { collected, total: serie.totalCards }
    }
    return map
  })

  function addCard(cardId: string, seriesId: string) {
    const existing = collections.value.find(c => c.cardId === cardId)
    if (existing) {
      existing.count++
    } else {
      collections.value.push({
        cardId,
        seriesId,
        acquiredAt: new Date().toISOString(),
        count: 1,
      })
    }
    saveToStorage(collections.value)
  }

  function isCollected(cardId: string): boolean {
    return collectedCardSet.value.has(cardId)
  }

  function getDuplicateCount(cardId: string): number {
    return collectionMap.value[cardId] || 0
  }

  function resetAll() {
    collections.value = []
    saveToStorage(collections.value)
  }

  return {
    collections,
    collectedCardIds,
    collectedCardSet,
    collectionMap,
    totalAllCards,
    totalCollected,
    collectionRate,
    seriesProgressMap,
    addCard,
    isCollected,
    getDuplicateCount,
    resetAll,
  }
})
