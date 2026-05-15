<template>
  <div class="draw-page" :class="{ 'secret-flash-active': secretFlash }">
    <NavBar :showClose="true" @close="showExitConfirm = true">
      <template #right>
        <span class="balance">已抽 {{ drawCount }} 次</span>
      </template>
    </NavBar>

    <div class="draw-content">
      <div class="box-section" @click="handleDraw">
        <BlindBox3D
          :is-opening="isAnimating"
          :is-opened="showResult"
          :rarity="lastRarity"
        />
        <div class="hint-text-wrapper">
          <p class="hint-text" :key="hintText">{{ hintText }}</p>
          <div class="pity-progress" v-if="!isAnimating && !showResult && !allCollected">
            <div class="pity-bar">
              <div class="pity-fill" :style="{ width: pityProgress + '%' }"></div>
            </div>
            <span class="pity-label">保底 {{ pityCount }} 次</span>
          </div>
        </div>
      </div>

      <!-- Result card "flyout" overlay -->
      <Transition name="result-reveal">
        <div class="result-overlay" v-if="showResult && lastResultItem" @click.self>
          <div class="result-card" :class="[lastRarity]">
            <div class="result-emoji">{{ lastResultItem.emoji }}</div>
            <div class="result-name">{{ lastResultItem.name }}</div>
            <div class="result-rarity">{{ rarityLabel }}</div>
            <div class="result-subtitle" v-if="lastResultItem.subtitle">{{ lastResultItem.subtitle }}</div>
            <div class="result-badge" v-if="isNewCard">
              <span class="badge-dot">✦</span> 新收藏
            </div>
            <div class="result-badge duplicate" v-else>
              已拥有 {{ duplicateCount }} 张
            </div>
            <!-- Secret shimmer overlay -->
            <div class="secret-shimmer" v-if="lastRarity === 'secret'"></div>
          </div>

          <!-- Legendary/Secret particles -->
          <div class="particle-container" v-if="lastRarity === 'legendary' || lastRarity === 'secret'">
            <div
              v-for="i in particleCount"
              :key="i"
              class="particle"
              :style="particleStyle(i)"
            ></div>
          </div>

          <div class="result-actions">
            <button class="action-btn primary" @click.stop="goToResult">
              查看详情
            </button>
            <button class="action-btn secondary" @click.stop="resetAndDraw">
              继续抽卡
            </button>
          </div>
        </div>
      </Transition>

      <!-- Draw button (fallback for tapping) -->
      <button
        v-if="!showResult"
        class="draw-btn"
        :class="{ disabled: allCollected || isAnimating }"
        :disabled="allCollected || isAnimating"
        @click="handleDraw"
      >
        {{ allCollected ? '已集齐' : '点击盒子开箱' }}
      </button>

      <div class="completion-badge" v-if="allCollected && !showResult">
        <span>🎉 已收集全部 {{ serie?.totalCards }} 张卡片</span>
      </div>
    </div>

    <!-- Exit confirm dialog -->
    <div class="modal-overlay" v-if="showExitConfirm" @click.self="showExitConfirm = false">
      <div class="modal-dialog">
        <p class="modal-text">确定退出抽卡？本次机会不消耗</p>
        <div class="modal-actions">
          <button class="modal-btn modal-cancel" @click="showExitConfirm = false">继续抽卡</button>
          <button class="modal-btn modal-confirm" @click="confirmExit">确定退出</button>
        </div>
      </div>
    </div>

    <Toast :message="toastMessage" v-if="toastMessage" @close="toastMessage = ''" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSerieById } from '@/mock/series'
import type { BlindBox, Rarity } from '@/types'
import { useCollectionStore } from '@/stores/collection'
import { useDrawStore } from '@/stores/draw'
import NavBar from '@/components/NavBar.vue'
import BlindBox3D from '@/components/BlindBox3D.vue'
import Toast from '@/components/Toast.vue'

const route = useRoute()
const router = useRouter()
const collectionStore = useCollectionStore()
const drawStore = useDrawStore()

const seriesId = computed(() => route.params.seriesId as string)
const serie = computed(() => getSerieById(seriesId.value))
const drawCount = computed(() => drawStore.getSerieDrawCount(seriesId.value))
const pityCount = computed(() => drawStore.getSeriePityCount(seriesId.value))
const pityProgress = computed(() => Math.min(100, (drawCount.value / 60) * 100))

const isAnimating = ref(false)
const showResult = ref(false)
const showExitConfirm = ref(false)
const toastMessage = ref('')
const lastResultItem = ref<BlindBox | null>(null)
const lastRarity = ref<Rarity>('common')
const isNewCard = ref(false)
const duplicateCount = ref(0)
const secretFlash = ref(false)

const allCollected = computed(() => {
  if (!serie.value) return false
  const collected = serie.value.cards.filter((c: BlindBox) => collectionStore.isCollected(c.id)).length
  return collected >= serie.value.totalCards
})

const rarityLabel = computed(() => {
  const labels: Record<Rarity, string> = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说', secret: '隐藏' }
  return labels[lastRarity.value] || ''
})

const particleCount = computed(() => lastRarity.value === 'secret' ? 24 : 12)

const hintText = computed(() => {
  if (isAnimating.value) return '开盒中...'
  if (showResult.value) return ''
  if (allCollected.value) return '恭喜集齐！'
  return '点击盒子开箱'
})

function particleStyle(i: number) {
  const total = particleCount.value
  const angle = (i / total) * 360
  const delay = (i * 0.08).toFixed(2)
  const dist = lastRarity.value === 'secret' ? 120 : 80
  const tx = Math.cos((angle * Math.PI) / 180) * dist
  const ty = Math.sin((angle * Math.PI) / 180) * dist
  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}s`,
    '--tx': `${tx}px`,
    '--ty': `${ty}px`,
    '--hue': lastRarity.value === 'secret' ? `${45 + i * 15}` : `${200 + i * 10}`,
  }
}

async function handleDraw() {
  if (isAnimating.value || allCollected.value || showResult.value) return
  if (!serie.value) return

  isAnimating.value = true
  lastResultItem.value = null
  showResult.value = false
  secretFlash.value = false

  // Perform draw immediately (API call)
  try {
    const result = await drawStore.performDraw(seriesId.value)
    if (!result) {
      isAnimating.value = false
      return
    }

    lastResultItem.value = result.result.item
    lastRarity.value = result.result.item.rarity as Rarity
    isNewCard.value = result.result.isNew
    duplicateCount.value = result.result.duplicateCount

    // Animation sequence:
    // 1. Box shakes (0.5s * 2 = 1.0s) + glow begins
    // 2. Lid opens (1.2s), light beam shoots up
    // 3. Brief pause, then show result card

    // Secret: trigger full-screen flash after shake + lid
    if (lastRarity.value === 'secret') {
      setTimeout(() => { secretFlash.value = true }, 300)
    }

    // Wait for box open animation, then reveal result
    await new Promise(resolve => setTimeout(resolve, 1800))

    showResult.value = true
    isAnimating.value = false

    // Secret: extended afterglow
    if (lastRarity.value === 'secret') {
      setTimeout(() => { secretFlash.value = false }, 600)
    }
  } catch (e: any) {
    toastMessage.value = e?.message || '抽卡失败，请重试'
    isAnimating.value = false
    showResult.value = false
  }
}

function goToResult() {
  router.push({ name: 'Result' })
}

function resetAndDraw() {
  showResult.value = false
  lastResultItem.value = null
  // Re-trigger draw
  handleDraw()
}

function confirmExit() {
  showExitConfirm.value = false
  drawStore.clearLastResult()
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.draw-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--color-bg) 0%, #F0F4F8 100%);
  position: relative;
  overflow: hidden;
}

.balance {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.draw-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-lg) 80px;
  position: relative;
  overflow: hidden;
}

.box-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* ── Hint text ── */
.hint-text-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: var(--spacing-lg);
  min-height: 60px;
}

.hint-text {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ── Pity progress bar ── */
.pity-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 200px;
  margin-top: 8px;
}

.pity-bar {
  width: 100%;
  height: 4px;
  background: var(--color-divider);
  border-radius: 2px;
  overflow: hidden;
}

.pity-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #7AB8D4);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.pity-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

/* ── Result Overlay: card flies out ── */
.result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.96);
  z-index: 10;
  padding: var(--spacing-xl);
}

.result-reveal-enter-active {
  animation: resultReveal 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes resultReveal {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  border-radius: var(--radius-xl);
  background: var(--color-white);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  margin-bottom: var(--spacing-xl);
  width: 220px;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
  animation: cardGlideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes cardGlideIn {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.6) rotateX(15deg);
  }
  60% {
    opacity: 1;
    transform: translateY(-8px) scale(1.02) rotateX(0deg);
  }
  100% {
    transform: translateY(0) scale(1) rotateX(0deg);
  }
}

/* ── Rarity card styles ── */
.result-card.common { border: 2px solid #D4C9B8; }
.result-card.rare { border: 2px solid #9FB8D4; }
.result-card.epic { border: 2px solid #B8A8D8; }

.result-card.legendary {
  border: 2px solid #E8C87A;
  box-shadow: 0 8px 32px rgba(232,200,122,0.3), 0 0 40px rgba(232,200,122,0.1);
  animation: cardGlideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
             legendaryGlow 2s ease-in-out 0.6s infinite;
}

@keyframes legendaryGlow {
  0%, 100% { box-shadow: 0 8px 32px rgba(232,200,122,0.3), 0 0 40px rgba(232,200,122,0.1); }
  50% { box-shadow: 0 8px 48px rgba(232,200,122,0.5), 0 0 60px rgba(232,200,122,0.2); }
}

.result-card.secret {
  border: 2px solid #E8C87A;
  background: linear-gradient(135deg, #FFFDF8, #FFF5E0, #FFFDF8);
  box-shadow: 0 8px 32px rgba(232,200,122,0.4);
  animation: cardGlideIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
             secretGlow 1.5s ease-in-out 0.6s infinite;
}

@keyframes secretGlow {
  0%, 100% { box-shadow: 0 8px 32px rgba(232,200,122,0.4), 0 0 60px rgba(232,200,122,0.15); }
  50% { box-shadow: 0 8px 56px rgba(232,200,122,0.7), 0 0 100px rgba(232,200,122,0.3); }
}

.result-emoji {
  font-size: 64px;
  line-height: 1;
  margin-bottom: var(--spacing-md);
  animation: emojiBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes emojiBounce {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.result-name {
  font-size: var(--font-size-title);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.result-rarity {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.result-subtitle {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-sm);
}

.result-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #A8C5D6, #7AB8D4);
  color: var(--color-white);
  font-size: var(--font-size-small);
  font-weight: 600;
}

.result-badge.duplicate {
  background: var(--color-divider);
  color: var(--color-text-secondary);
}

.badge-dot {
  font-size: 12px;
}

/* ── Secret shimmer on card ── */
.secret-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.5),
    transparent
  );
  animation: shimmer 2s ease-in-out 0.5s infinite;
}

@keyframes shimmer {
  0% { left: -60%; }
  100% { left: 120%; }
}

/* ── Result actions ── */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  width: 200px;
}

.action-btn {
  width: 100%;
  height: 48px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: 600;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}
.action-btn:active {
  transform: scale(0.97);
}
.action-btn.primary {
  background: var(--color-text);
  color: var(--color-white);
}
.action-btn.secondary {
  background: var(--color-divider);
  color: var(--color-text);
}

/* ── Particle effects ── */
.particle-container {
  position: absolute;
  top: 35%;
  left: 50%;
  pointer-events: none;
  z-index: 5;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: hsl(var(--hue), 80%, 60%);
  opacity: 0;
  animation: particleBurst 1.5s ease-out var(--delay) forwards;
}

@keyframes particleBurst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(0);
  }
  30% {
    opacity: 1;
    transform: translate(var(--tx), var(--ty)) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(calc(var(--tx) * 0.5), calc(var(--ty) * 0.5)) scale(0);
  }
}

/* ── Draw button (fixed bottom) ── */
.draw-btn {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 48px;
  border-radius: var(--radius-xl);
  background: var(--color-primary);
  color: var(--color-white);
  font-size: var(--font-size-body);
  font-weight: 600;
  letter-spacing: 1px;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px rgba(168, 197, 214, 0.3);
  z-index: 5;
  -webkit-tap-highlight-color: transparent;
}
.draw-btn:active:not(.disabled) {
  transform: translateX(-50%) scale(0.97);
  box-shadow: 0 2px 8px rgba(168, 197, 214, 0.2);
}
.draw-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-text-tertiary);
  box-shadow: none;
}

/* ── Completion badge ── */
.completion-badge {
  margin-top: var(--spacing-md);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  color: #2E7D32;
  font-size: var(--font-size-caption);
  font-weight: 600;
}

/* ── Secret flash overlay ── */
.secret-flash-active::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(232,200,122,0.35), transparent 60%);
  pointer-events: none;
  z-index: 50;
  animation: secretFlashFade 1s ease-out forwards;
}

@keyframes secretFlashFade {
  0% { opacity: 0; transform: scale(0.5); }
  20% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.3); }
}

/* ── Modal ── */
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
.modal-dialog {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 320px;
  width: 100%;
  box-shadow: var(--shadow-lg);
}
.modal-text {
  font-size: var(--font-size-body);
  color: var(--color-text);
  text-align: center;
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}
.modal-actions {
  display: flex;
  gap: var(--spacing-md);
}
.modal-btn {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: 500;
  transition: all var(--transition-fast);
}
.modal-cancel {
  background: var(--color-divider);
  color: var(--color-text);
}
.modal-cancel:active {
  background: #E8E8EC;
}
.modal-confirm {
  background: var(--color-primary);
  color: var(--color-white);
}
.modal-confirm:active {
  background: var(--color-primary-dark);
}
</style>
