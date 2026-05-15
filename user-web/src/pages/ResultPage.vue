<template>
  <div class="result-page" :class="{ 'secret-effect': isSecret }">
    <NavBar :showClose="true" @close="goBack" />

    <div class="result-content">
      <transition name="scale-in" appear>
        <div class="card-section" v-if="card">
          <ResultCard :card="card" />

          <div class="card-detail">
            <h3 class="detail-name">{{ fullName }}</h3>
            <p class="detail-rarity" :style="{ color: rarityColor }">
              {{ rarityLabel }}
            </p>
          </div>

          <div class="action-group">
            <button class="action-btn primary" @click="showDetail = true">查看详情</button>
            <button class="action-btn secondary" @click="goShare">分享</button>
          </div>

          <!-- Duplicate info -->
          <p class="duplicate-info" v-if="duplicateCount > 1">
            已拥有 {{ duplicateCount }} 张
          </p>
        </div>
      </transition>
    </div>

    <!-- Detail modal -->
    <div class="modal-overlay" v-if="showDetail" @click.self="showDetail = false">
      <div class="detail-modal">
        <h3 class="detail-title">{{ fullName }}</h3>
        <div class="detail-card-info">
          <p><strong>系列：</strong>{{ card?.serieName }}</p>
          <p><strong>稀有度：</strong>{{ rarityLabel }}</p>
          <p v-if="card?.subtitle"><strong>变体：</strong>{{ card.subtitle }}</p>
        </div>
        <div class="detail-description">
          <p>{{ card?.description || '暂无介绍' }}</p>
        </div>
        <button class="modal-close-btn" @click="showDetail = false">关闭</button>
      </div>
    </div>

    <!-- Secret particles -->
    <div class="secret-particles" v-if="isSecret">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { BlindBox, Rarity } from '@/types'
import { RARITY_CONFIG } from '@/types'
import { useDrawStore } from '@/stores/draw'
import { getSerieById } from '@/mock/series'
import { useCollectionStore } from '@/stores/collection'
import NavBar from '@/components/NavBar.vue'
import ResultCard from '@/components/ResultCard.vue'

const router = useRouter()
const drawStore = useDrawStore()

const card = ref<(BlindBox & { serieName?: string }) | null>(null)
const showDetail = ref(false)

onMounted(() => {
  // Get last drawn card from store
  const lastResult = drawStore.lastResult
  const lastProgress = drawStore.lastProgress

  if (lastResult && lastProgress) {
    card.value = {
      ...lastResult,
      serieName: lastProgress.seriesId,
    }
    // Lookup real serie name
    const serie = getSerieById(lastProgress.seriesId)
    if (serie) {
      card.value.serieName = serie.name
    }
  } else {
    // No result — go back home
    router.replace({ name: 'Home' })
  }
})

const isSecret = computed(() => card.value?.rarity === 'secret')
const rarity = computed(() => (card.value?.rarity || 'common') as Rarity)
const rarityColor = computed(() => RARITY_CONFIG[rarity.value].borderColor)
const rarityLabel = computed(() => `稀有度：${RARITY_CONFIG[rarity.value].label}`)

const collectionStore = useCollectionStore()

const duplicateCount = computed(() => {
  if (!card.value) return 0
  return collectionStore.getDuplicateCount(card.value.id)
})

const fullName = computed(() => {
  if (!card.value) return ''
  return card.value.subtitle
    ? `${card.value.name} · ${card.value.subtitle}`
    : card.value.name
})

function goBack() {
  const lastProgress = drawStore.lastProgress
  if (lastProgress) {
    router.push({ name: 'Draw', params: { seriesId: lastProgress.seriesId } })
  } else {
    router.push({ name: 'Home' })
  }
}

function goShare() {
  drawStore.clearLastResult()
  router.push({ name: 'Share' })
}

function particleStyle(i: number) {
  const angle = (i / 20) * 360
  const delay = (i * 0.1).toFixed(1)
  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}s`,
    '--tx': `${Math.cos((angle * Math.PI) / 180) * 80}px`,
    '--ty': `${Math.sin((angle * Math.PI) / 180) * 80}px`,
  } as any
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-lg) 60px;
}

.card-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.card-detail {
  text-align: center;
}

.detail-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.detail-rarity {
  font-size: var(--font-size-caption);
  font-weight: 600;
}

.action-group {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.action-btn {
  width: 140px;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: 500;
  transition: all var(--transition-fast);
}
.action-btn:active {
  transform: scale(0.97);
}
.action-btn.primary {
  background: var(--color-primary);
  color: var(--color-white);
}
.action-btn.secondary {
  background: var(--color-white);
  color: var(--color-text);
  border: 1px solid var(--color-divider);
}

.duplicate-info {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
}

/* Scale-in animation */
.scale-in-enter-active {
  animation: scaleIn 0.4s ease-out;
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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
}
.detail-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  text-align: center;
}
.detail-card-info {
  margin-bottom: var(--spacing-md);
}
.detail-card-info p {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}
.detail-card-info strong {
  color: var(--color-text);
}
.detail-description {
  background: var(--bg-page);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
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

/* Secret particles */
.secret-particles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}
.secret-effect .result-content {
  position: relative;
  z-index: 1;
}
.particle {
  position: absolute;
  top: 40%;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E8C87A;
  opacity: 0;
  animation: particleBurst 2s ease-out var(--delay) forwards;
}
@keyframes particleBurst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(0);
  }
}
</style>
