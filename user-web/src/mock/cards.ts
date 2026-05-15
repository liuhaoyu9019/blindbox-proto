import type { BlindBox, Rarity } from '@/types'

// Rarity probability weights
const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 0.55,
  rare: 0.25,
  epic: 0.12,
  legendary: 0.07,
  secret: 0.01,
}

export function rollRarity(drawCount: number): Rarity {
  // Hard pity: 60 draws without legendary → force legendary
  if (drawCount >= 60) return 'legendary'

  const rates = { ...RARITY_WEIGHTS }

  // Soft pity: after 40 draws, legendary probability increases by 3% per draw
  if (drawCount > 40) {
    const bonus = (drawCount - 40) * 0.03
    rates.legendary += bonus
    rates.common = Math.max(0, rates.common - bonus)
  }

  const rand = Math.random()
  let cumulative = 0
  for (const [rarity, rate] of Object.entries(rates)) {
    cumulative += rate
    if (rand < cumulative) return rarity as Rarity
  }
  return 'common'
}

export function pickCardByRarity(cards: BlindBox[], rarity: Rarity): BlindBox {
  const filtered = cards.filter(c => c.rarity === rarity)
  // If no card of that rarity exists (shouldn't happen with good data), fallback to random
  if (filtered.length === 0) {
    return cards[Math.floor(Math.random() * cards.length)]
  }
  return filtered[Math.floor(Math.random() * filtered.length)]
}

// Simulate network delay
export function simulateNetworkDelay(): Promise<void> {
  const ms = 300 + Math.random() * 500
  return new Promise(resolve => setTimeout(resolve, ms))
}
