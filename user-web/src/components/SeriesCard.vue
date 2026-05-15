<template>
  <div class="series-card" @click="$emit('click')">
    <div class="series-cover">
      <span class="series-emoji">{{ serie.emoji }}</span>
    </div>
    <div class="series-info">
      <div class="series-name">{{ serie.name }}</div>
      <div class="series-count">{{ serie.totalCards }} 款</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Serie } from '@/types'

defineProps<{
  serie: Serie
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.series-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: var(--shadow-sm);
}
.series-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-md);
}
.series-cover {
  aspect-ratio: 3 / 4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0F4F8, #E8EEF5);
  position: relative;
}
.series-emoji {
  font-size: 52px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
.series-info {
  padding: var(--spacing-md) var(--spacing-sm);
}
.series-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.series-count {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  margin-top: 2px;
}
</style>
