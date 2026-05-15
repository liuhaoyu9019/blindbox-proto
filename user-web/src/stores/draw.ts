import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BlindBox, Rarity } from '@/types'
import { useCollectionStore } from './collection'
import { executeDraw } from '@/api'

const COUNTER_KEY = 'blindbox_draw_counters'

function loadCounters(): Record<string, number> {
  try {
    const data = localStorage.getItem(COUNTER_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveCounters(counters: Record<string, number>) {
  localStorage.setItem(COUNTER_KEY, JSON.stringify(counters))
}

export const useDrawStore = defineStore('draw', () => {
  const drawCounters = ref<Record<string, number>>(loadCounters())
  const isDrawing = ref(false)
  const lastResult = ref<BlindBox | null>(null)
  const lastProgress = ref<{
    seriesId: string
    collectedCount: number
    totalCount: number
    drawCount: number
    pityCount: number
  } | null>(null)

  const getDrawCount = computed(() => (seriesId: string) => drawCounters.value[seriesId] || 0)

  async function performDraw(seriesId: string) {
    if (isDrawing.value) return
    isDrawing.value = true

    try {
      const collectionStore = useCollectionStore()
      const count = drawCounters.value[seriesId] || 0

      const { result, progress } = await executeDraw(
        seriesId,
        count,
        collectionStore.collectedCardIds,
        collectionStore.collectionMap,
      )

      // Save the card
      collectionStore.addCard(result.item.id, seriesId)

      // Update counter
      drawCounters.value[seriesId] = count + 1
      saveCounters(drawCounters.value)

      lastResult.value = result.item
      lastProgress.value = progress

      return { result, progress }
    } finally {
      isDrawing.value = false
    }
  }

  function clearLastResult() {
    lastResult.value = null
    lastProgress.value = null
  }

  function getSerieDrawCount(seriesId: string): number {
    return drawCounters.value[seriesId] || 0
  }

  function getSeriePityCount(seriesId: string): number {
    const count = getSerieDrawCount(seriesId)
    return Math.max(0, 60 - count)
  }

  return {
    drawCounters,
    isDrawing,
    lastResult,
    lastProgress,
    getDrawCount,
    performDraw,
    clearLastResult,
    getSerieDrawCount,
    getSeriePityCount,
  }
})
