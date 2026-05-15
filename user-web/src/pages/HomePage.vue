<template>
  <div class="home-page">
    <NavBar :showClose="false">
      <template #left>
        <span class="brand-name">盲盒</span>
      </template>
      <template #right>
        <button class="search-btn" @click="showSearchHint">🔍</button>
      </template>
    </NavBar>

    <div class="content">
      <h2 class="section-title">探索系列</h2>

      <div v-if="loading" class="loading-state">
        <div class="skeleton-grid">
          <div v-for="i in 4" :key="i" class="skeleton-card">
            <div class="skeleton-cover"></div>
            <div class="skeleton-info">
              <div class="skeleton-line skeleton-name"></div>
              <div class="skeleton-line skeleton-count"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="series.length === 0" class="empty-state">
        <span class="empty-icon">📦</span>
        <p>暂无系列，敬请期待</p>
      </div>

      <div v-else class="series-grid">
        <SeriesCard
          v-for="serie in series"
          :key="serie.id"
          :serie="serie"
          @click="goToDraw(serie.id)"
        />
      </div>

      <!-- Collection progress entry -->
      <div class="progress-entry" @click="goToCollection">
        <div class="progress-left">
          <span class="progress-icon">📚</span>
          <span class="progress-label">我的收藏</span>
        </div>
        <div class="progress-right">
          <div class="progress-bar-wrapper">
            <div class="progress-bar" :style="{ width: collectionStore.collectionRate + '%' }"></div>
          </div>
          <span class="progress-count">
            {{ collectionStore.totalCollected }}/{{ collectionStore.totalAllCards }}
          </span>
        </div>
      </div>
    </div>

    <Toast :message="toastMessage" v-if="toastMessage" @close="toastMessage = ''" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Serie } from '@/types'
import { useCollectionStore } from '@/stores/collection'
import { fetchSeriesList } from '@/api'
import NavBar from '@/components/NavBar.vue'
import SeriesCard from '@/components/SeriesCard.vue'
import Toast from '@/components/Toast.vue'

const router = useRouter()
const collectionStore = useCollectionStore()

const series = ref<Serie[]>([])
const loading = ref(true)
const toastMessage = ref('')

onMounted(async () => {
  try {
    series.value = await fetchSeriesList()
  } catch {
    toastMessage.value = '加载失败'
  } finally {
    loading.value = false
  }
})

function goToDraw(seriesId: string) {
  router.push({ name: 'Draw', params: { seriesId } })
}

function goToCollection() {
  router.push({ name: 'Collection' })
}

function showSearchHint() {
  toastMessage.value = '搜索功能即将上线'
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: var(--spacing-xl);
}

.brand-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: 1px;
}

.search-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 50%;
  transition: background var(--transition-fast);
}
.search-btn:active {
  background: rgba(0,0,0,0.05);
}

.content {
  padding: 0 var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
  margin-top: var(--spacing-sm);
}

/* Series grid */
.series-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

/* Loading skeletons */
.skeleton-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.skeleton-cover {
  aspect-ratio: 3 / 4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-info {
  padding: var(--spacing-md) var(--spacing-sm);
}
.skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
.skeleton-name {
  width: 70%;
  margin-bottom: 6px;
}
.skeleton-count {
  width: 40%;
  height: 11px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
}
.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}
.empty-state p {
  font-size: var(--font-size-body);
}

/* Progress entry */
.progress-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}
.progress-entry:active {
  transform: scale(0.98);
}
.progress-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.progress-icon {
  font-size: 22px;
}
.progress-label {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-text);
}
.progress-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.progress-bar-wrapper {
  width: 80px;
  height: 6px;
  background: var(--color-divider);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}
.progress-count {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.loading-state {
  padding: 0;
}
.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}
</style>
