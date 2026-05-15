import type { Serie, BlindBox, Collection } from '@/types'
import { getAllSeries, getSerieById } from '@/mock/series'
import { rollRarity, pickCardByRarity, simulateNetworkDelay } from '@/mock/cards'

// Mock API layer — swap these for real HTTP calls when backend is ready

export async function fetchSeriesList(): Promise<Serie[]> {
  await simulateNetworkDelay()
  return getAllSeries()
}

export async function fetchSeriesDetail(id: string): Promise<Serie | null> {
  await simulateNetworkDelay()
  return getSerieById(id) || null
}

export interface DrawResult {
  item: BlindBox
  isNew: boolean
  isDuplicate: boolean
  duplicateCount: number
}

export interface DrawProgress {
  seriesId: string
  collectedCount: number
  totalCount: number
  drawCount: number
  pityCount: number
}

export async function executeDraw(
  seriesId: string,
  drawCount: number,
  collectedCardIds: string[],
  collectionMap: Record<string, number>,
): Promise<{ result: DrawResult; progress: DrawProgress }> {
  await simulateNetworkDelay()

  const serie = getSerieById(seriesId)
  if (!serie) throw new Error('Series not found')

  const rarity = rollRarity(drawCount)
  const card = pickCardByRarity(serie.cards, rarity)

  const isAlreadyOwned = collectedCardIds.includes(card.id)
  const duplicateCount = (collectionMap[card.id] || 0) + 1

  // Count new collected after this draw
  let collectedCount = collectedCardIds.length
  if (!isAlreadyOwned) collectedCount++
  // If collected all, also check — but we keep simple count here

  const pityCount = drawCount >= 60 ? 0 : 60 - drawCount

  return {
    result: {
      item: card,
      isNew: !isAlreadyOwned,
      isDuplicate: isAlreadyOwned,
      duplicateCount,
    },
    progress: {
      seriesId,
      collectedCount,
      totalCount: serie.totalCards,
      drawCount: drawCount + 1,
      pityCount: Math.max(0, 60 - (drawCount + 1)),
    },
  }
}

export async function fetchCollectionStats(collections: Collection[], totalCards: number) {
  await simulateNetworkDelay()
  return {
    collectedCards: collections.length,
    totalCards,
    collectionRate: totalCards > 0 ? Math.round((collections.length / totalCards) * 100) : 0,
  }
}
