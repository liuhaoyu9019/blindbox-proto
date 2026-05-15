<template>
  <div class="result-card" :style="cardStyle">
    <div class="rarity-badge" :style="badgeStyle">
      {{ rarityBadge }}
    </div>
    <div class="card-art" :style="artStyle">
      <span class="card-emoji">{{ card.emoji }}</span>
    </div>
    <div class="card-name">{{ card.name }}</div>
    <div class="card-subtitle" v-if="card.subtitle">{{ card.serieName }} · {{ card.subtitle }}</div>
    <div class="card-subtitle" v-else>{{ card.serieName }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlindBox, Rarity } from '@/types'
import { RARITY_CONFIG } from '@/types'

const props = defineProps<{
  card: BlindBox & { serieName?: string }
}>()

const rarity = computed(() => props.card.rarity as Rarity)
const config = computed(() => RARITY_CONFIG[rarity.value])

const cardStyle = computed(() => ({
  borderColor: config.value.borderColor,
  background: rarity.value === 'secret' && config.value.gradient
    ? config.value.gradient
    : config.value.bgColor,
}))

const badgeStyle = computed(() => ({
  background: config.value.borderColor,
}))

const artStyle = computed(() => ({
  background: rarity.value === 'secret'
    ? 'linear-gradient(135deg, rgba(232,200,122,0.15), rgba(245,230,200,0.15))'
    : `${config.value.bgColor}dd`,
}))

const rarityBadge = computed(() => {
  const labels: Record<string, string> = {
    common: 'COMMON',
    rare: 'RARE',
    epic: 'EPIC',
    legendary: '✦ LEGENDARY ✦',
    secret: '★ SECRET ★',
  }
  return labels[props.card.rarity] || props.card.rarity.toUpperCase()
})
</script>

<style scoped>
.result-card {
  width: 200px;
  min-height: 280px;
  border-radius: 14px;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-md);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
  position: relative;
  overflow: hidden;
}

.rarity-badge {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 12px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-white);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.card-art {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 36px;
  margin-bottom: var(--spacing-md);
}

.card-emoji {
  font-size: 52px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.card-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
