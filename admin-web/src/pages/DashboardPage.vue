<template>
  <div class="dashboard-page">
    <h2 class="page-title">仪表盘</h2>

    <!-- Loading -->
    <div v-if="loading" style="text-align: center; padding: 60px 0;">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <p style="color: #909399; margin-top: 12px;">加载中...</p>
    </div>

    <template v-else-if="stats">
      <!-- Overview Cards -->
      <el-row :gutter="20" class="stat-cards">
        <el-col :xs="12" :sm="8" :md="6" v-for="card in overviewCards" :key="card.label">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-card-inner">
              <div class="stat-icon" :style="{ background: card.bg }">
                <el-icon :size="24" color="#fff">{{ card.icon }}</el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ card.value }}</div>
                <div class="stat-label">{{ card.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Charts Row -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- Rarity Distribution -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>稀有度分布</span>
            </template>
            <div class="rarity-chart">
              <div
                v-for="item in stats.rarityDistribution"
                :key="item.rarity"
                class="rarity-bar-row"
              >
                <span class="rarity-label">{{ rarityLabel(item.rarity) }}</span>
                <el-progress
                  :percentage="calcRarityPercent(item.count)"
                  :color="rarityColor(item.rarity)"
                  :stroke-width="20"
                  :text-inside="true"
                >
                  {{ item.count }}
                </el-progress>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- Top Series -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <span>热门系列 Top 10</span>
            </template>
            <div v-if="stats.topSeries.length === 0" style="text-align:center;color:#909399;padding:20px;">
              暂无数据
            </div>
            <div v-else class="top-series-list">
              <div
                v-for="(s, idx) in stats.topSeries"
                :key="s.id"
                class="top-series-item"
              >
                <span class="top-series-rank">#{{ idx + 1 }}</span>
                <span class="top-series-name">{{ s.name }}</span>
                <el-tag size="small" type="info">{{ s.drawCount }} 抽</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Recent Activities -->
      <el-card shadow="hover" style="margin-top: 20px;">
        <template #header>
          <span>最近动态</span>
        </template>
        <div v-if="stats.recentActivities.length === 0" style="text-align:center;color:#909399;padding:20px;">
          暂无动态
        </div>
        <el-timeline v-else>
          <el-timeline-item
            v-for="act in stats.recentActivities.slice(0, 10)"
            :key="act.timestamp"
            :timestamp="formatTime(act.timestamp)"
            :color="activityColor(act.type)"
          >
            <span class="activity-user">{{ act.user.nickname }}</span>
            {{ act.detail }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Loading, DataAnalysis, Collection, User, TrendCharts, Share } from '@element-plus/icons-vue';
import { statsApi } from '../api';
import type { StatsResponse, Rarity } from '../types';
import { RARITY_CONFIG } from '../types';

const stats = ref<StatsResponse | null>(null);
const loading = ref(true);

const overviewCards = computed(() => {
  if (!stats.value) return [];
  const o = stats.value.overview;
  return [
    { label: '系列总数', value: o.totalSeries, icon: Collection, bg: '#409EFF' },
    { label: '卡片总数', value: o.totalItems, icon: DataAnalysis, bg: '#67C23A' },
    { label: '用户总数', value: o.totalUsers, icon: User, bg: '#E6A23C' },
    { label: '总抽卡次数', value: o.totalDraws, icon: TrendCharts, bg: '#9B59B6' },
    { label: '今日新增', value: o.todayNewUsers, icon: User, bg: '#F56C6C' },
    { label: '今日抽卡', value: o.todayDraws, icon: TrendCharts, bg: '#909399' },
    { label: '今日分享', value: o.todayShares, icon: Share, bg: '#A8C5D6' },
  ];
});

function rarityLabel(r: Rarity) {
  return RARITY_CONFIG[r]?.label || r;
}
function rarityColor(r: Rarity) {
  return RARITY_CONFIG[r]?.color || '#909399';
}
function calcRarityPercent(count: number) {
  const total = stats.value?.rarityDistribution.reduce((s, i) => s + i.count, 0) || 1;
  return Math.round((count / total) * 100);
}
function activityColor(type: string) {
  return type === 'draw' ? '#409EFF' : type === 'register' ? '#67C23A' : '#E6A23C';
}
function formatTime(ts: string) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

onMounted(async () => {
  try {
    stats.value = await statsApi.get();
  } catch (e: any) {
    console.error('Failed to load stats:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
}
.page-title {
  margin: 0 0 20px;
  font-size: 20px;
  color: #303133;
}
.stat-cards {
  margin-bottom: 0;
}
.stat-card {
  margin-bottom: 20px;
}
.stat-card-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.rarity-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rarity-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rarity-label {
  width: 50px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}
.top-series-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.top-series-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.top-series-rank {
  width: 24px;
  font-weight: bold;
  color: #909399;
  font-size: 13px;
}
.top-series-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
}
.activity-user {
  font-weight: 600;
  color: #409EFF;
}
</style>
