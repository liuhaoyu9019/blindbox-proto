<template>
  <div
    class="collection-item"
    :class="{ collected: isCollected, secret: isSecret }"
    @click="isCollected ? $emit('click') : undefined"
  >
    <div v-if="isCollected" class="item-inner" :style="itemStyle">
      <span class="item-emoji">{{ card.emoji }}</span>
      <div class="item-rarity-bar" :style="barStyle"></div>
    </div>
    <div v-else class="item-placeholder">
      <span class="placeholder-mark">?</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BlindBox, Rarity } from '@/types'
import { RARITY_CONFIG } from '@/types'

const props = defineProps<{
  card: BlindBox
  isCollected: boolean
}>()

const rarity = computed(() => props.card.rarity as Rarity)
const isSecret = computed(() => props.card.rarity === 'secret')
const config = computed(() => RARITY_CONFIG[rarity.value])

const barStyle = computed(() => ({
  background: rarity.value === 'secret' && config.value.gradient
    ? config.value.gradient
    : config.value.borderColor,
}))

const itemStyle = computed(() =>
  rarity.value === 'secret'
    ? { background: 'linear-gradient(135deg, #FFFDF8, #F8F4E8)' }
    : {}
)

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.collection-item {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-fast);
}
.collection-item:active {
  transform: scale(0.95);
}
.collected {
  box-shadow: var(--shadow-sm);
}
.item-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  position: relative;
}
.collected.secret .item-inner {
  animation: secretShimmer 3s ease-in-out infinite;
}
.item-emoji {
  font-size: 32px;
  margin-bottom: 4px;
}
.item-rarity-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0 0 8px 8px;
}
.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  border: 1.5px dashed var(--color-divider);
  border-radius: var(--radius-sm);
}
.placeholder-mark {
  font-size: 24px;
  color: var(--color-text-tertiary);
  font-weight: 300;
}
@keyframes secretShimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
</style>
