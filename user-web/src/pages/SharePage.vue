<template>
  <div class="share-page">
    <NavBar title="分享卡片" :showBack="true" @back="goBack" />

    <div class="share-content">
      <div class="card-preview" v-if="card">
        <ShareCard :card="card" :username="'@神秘收藏家'" />
      </div>

      <div class="action-buttons">
        <button class="share-action-btn save" @click="saveImage">
          ↓ 保存图片
        </button>
        <button class="share-action-btn share" @click="shareCard">
          ↗ 分享到...
        </button>
      </div>
    </div>

    <Toast :message="toastMessage" v-if="toastMessage" @close="toastMessage = ''" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { BlindBox } from '@/types'
import { useDrawStore } from '@/stores/draw'
import { getSerieById } from '@/mock/series'
import NavBar from '@/components/NavBar.vue'
import ShareCard from '@/components/ShareCard.vue'
import Toast from '@/components/Toast.vue'

const router = useRouter()
const drawStore = useDrawStore()

const card = ref<(BlindBox & { serieName?: string }) | null>(null)
const toastMessage = ref('')

onMounted(() => {
  const lastResult = drawStore.lastResult
  if (!lastResult) {
    drawStore.clearLastResult()
    router.replace({ name: 'Home' })
    return
  }
  const serie = getSerieById(lastResult.seriesId)
  card.value = {
    ...lastResult,
    serieName: serie?.name || lastResult.seriesId,
  }
})

function goBack() {
  router.push({ name: 'Result' })
}

async function saveImage() {
  // Try using html2canvas — for now show message about the feature
  try {
    const html2canvas = (await import('html2canvas')).default
    const previewEl = document.querySelector('.card-preview') as HTMLElement
    if (!previewEl) {
      toastMessage.value = '保存失败，请重试'
      return
    }
    const canvas = await html2canvas(previewEl, {
      backgroundColor: '#ffffff',
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = 'blindbox-card.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    toastMessage.value = '图片已保存'
  } catch {
    toastMessage.value = '保存失败，请检查权限'
  }
}

async function shareCard() {
  if (!card.value) return

  const shareData = {
    title: `盲盒 · ${card.value.name}`,
    text: `我在盲盒中抽到了「${card.value.name}」！快来一起玩吧~`,
    url: window.location.href,
  }

  if (navigator.share && window.isSecureContext) {
    try {
      await navigator.share(shareData)
    } catch {
      // User cancelled or error
    }
  } else {
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(window.location.href)
      toastMessage.value = '链接已复制'
    } catch {
      toastMessage.value = '分享链接已复制'
    }
  }
}
</script>

<style scoped>
.share-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.share-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-lg) 40px;
}

.card-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
  max-width: 320px;
}

.share-action-btn {
  width: 100%;
  height: 48px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: 600;
  transition: all var(--transition-fast);
}
.share-action-btn:active {
  transform: scale(0.98);
}
.share-action-btn.save {
  background: var(--color-primary);
  color: var(--color-white);
}
.share-action-btn.share {
  background: var(--color-white);
  color: var(--color-text);
  border: 1px solid var(--color-divider);
}
</style>
