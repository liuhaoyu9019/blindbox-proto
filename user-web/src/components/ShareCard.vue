<template>
  <div class="share-card">
    <div class="share-card-visual">
      <span class="share-emoji">{{ card.emoji }}</span>
      <div class="share-name">{{ card.name }}</div>
      <div class="share-subtitle" v-if="card.subtitle">「{{ card.subtitle }}」</div>
      <div class="share-series">系列：{{ card.serieName }}</div>
    </div>
    <div class="share-divider"></div>
    <div class="share-footer">
      <div class="share-rarity" :style="{ color: borderColor }">{{ rarityLabel }}</div>
      <div class="share-username">{{ username }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlindBox, Rarity } from '@/types'
import { RARITY_CONFIG } from '@/types'

const props = withDefaults(defineProps<{
  card: BlindBox & { serieName?: string }
  username?: string
}>(), {
  username: '@神秘收藏家',
})

const rarity = computed(() => props.card.rarity as Rarity)
const borderColor = computed(() => RARITY_CONFIG[rarity.value].borderColor)
const rarityLabel = computed(() => `稀有度：${RARITY_CONFIG[rarity.value].label}`)
</script>

<style scoped>
.share-card {
  max-width: 320px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  overflow: hidden;
}

.share-card-visual {
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-emoji {
  font-size: 72px;
  margin-bottom: var(--spacing-md);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
}

.share-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.share-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.share-series {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.share-divider {
  height: 1px;
  background: var(--color-divider);
  margin: 0 var(--spacing-xl);
}

.share-footer {
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.share-rarity {
  font-size: var(--font-size-caption);
  font-weight: 600;
}

.share-username {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}
</style>
