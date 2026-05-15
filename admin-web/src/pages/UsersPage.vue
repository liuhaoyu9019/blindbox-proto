<template>
  <div class="users-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
    </div>

    <!-- Search -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.keyword" placeholder="搜索昵称" clearable @clear="fetchData" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.isBanned" placeholder="全部" clearable style="width: 120px;" @change="fetchData">
            <el-option label="正常" :value="false" />
            <el-option label="已封禁" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" stripe style="width: 100%" :empty-text="loading ? '加载中...' : '暂无数据'">
        <el-table-column prop="nickname" label="昵称" min-width="140" />
        <el-table-column label="头像" width="70" align="center">
          <template #default="{ row }">
            <el-avatar
              :size="36"
              :src="row.avatarUrl || undefined"
            >
              {{ row.nickname?.charAt(0) || '?' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isBanned ? 'danger' : 'success'" size="small" effect="plain">
              {{ row.isBanned ? '已封禁' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="drawCount" label="抽卡次数" width="100" align="center" />
        <el-table-column prop="collectionCount" label="已收集卡数" width="110" align="center" />
        <el-table-column prop="createdAt" label="注册时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="viewDetail(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button
              v-if="!row.isBanned"
              size="small"
              type="warning"
              link
              @click="handleBan(row, true)"
            >
              <el-icon><Lock /></el-icon>封禁
            </el-button>
            <el-button
              v-else
              size="small"
              type="success"
              link
              @click="handleBan(row, false)"
            >
              <el-icon><Unlock /></el-icon>解封
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="fetchData"
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="用户详情"
      width="650px"
      :close-on-click-modal="false"
    >
      <div v-if="detailLoading" style="text-align:center;padding:40px;">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      </div>
      <template v-else-if="userDetail">
        <!-- User Info -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="昵称">{{ userDetail.user.nickname }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="userDetail.user.isBanned ? 'danger' : 'success'" size="small">
              {{ userDetail.user.isBanned ? '已封禁' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatTime(userDetail.user.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(userDetail.user.updatedAt) }}</el-descriptions-item>
        </el-descriptions>

        <!-- Stats -->
        <h4 style="margin: 20px 0 10px;">数据统计</h4>
        <el-row :gutter="12">
          <el-col :span="8" v-for="s in statItems" :key="s.label">
            <div class="stat-box">
              <div class="stat-box-value">{{ s.value }}</div>
              <div class="stat-box-label">{{ s.label }}</div>
            </div>
          </el-col>
        </el-row>

        <!-- Rarity Distribution -->
        <div v-if="rarityStats.length" style="margin-top: 16px;">
          <h4 style="margin: 0 0 8px;">稀有度分布</h4>
          <div v-for="r in rarityStats" :key="r.rarity" class="rarity-line">
            <span class="rarity-line-label">{{ r.label }}</span>
            <el-progress
              :percentage="r.percent"
              :color="r.color"
              :stroke-width="16"
              :text-inside="true"
            >
              {{ r.count }}
            </el-progress>
          </div>
        </div>

        <!-- Recent Draws -->
        <h4 style="margin: 20px 0 10px;">最近抽卡</h4>
        <div v-if="userDetail.recentDraws.length === 0" style="color:#909399;padding:12px;">暂无记录</div>
        <el-timeline v-else>
          <el-timeline-item
            v-for="d in userDetail.recentDraws.slice(0, 5)"
            :key="d.drawnAt"
            :timestamp="formatTime(d.drawnAt)"
            placement="top"
          >
            {{ d.item.emoji }} {{ d.item.name }}
            <el-tag size="small" :color="rarityColor(d.item.rarity)" effect="dark" style="color:#fff;margin-left:4px;">
              {{ rarityLabel(d.item.rarity) }}
            </el-tag>
          </el-timeline-item>
        </el-timeline>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Ban Reason Dialog -->
    <el-dialog
      v-model="banDialogVisible"
      title="封禁用户"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="banForm" label-width="80px">
        <el-form-item label="封禁原因" prop="reason">
          <el-input
            v-model="banForm.reason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请填写封禁原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="banSubmitting" @click="confirmBan">确认封禁</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { View, Lock, Unlock, Loading } from '@element-plus/icons-vue';
import { usersApi } from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UserListItem, UserDetail, Rarity } from '../types';
import { RARITY_CONFIG } from '../types';

const list = ref<UserListItem[]>([]);
const loading = ref(false);

const searchForm = reactive({
  keyword: '',
  isBanned: undefined as boolean | undefined,
});
const pagination = reactive({ page: 1, pageSize: 20, total: 0 });

// Detail dialog
const detailVisible = ref(false);
const detailLoading = ref(false);
const userDetail = ref<UserDetail | null>(null);

const statItems = computed(() => {
  if (!userDetail.value) return [];
  const s = userDetail.value.stats;
  return [
    { label: '总抽卡', value: s.totalDraws },
    { label: '不同卡', value: s.uniqueCards },
    { label: '重复卡', value: s.totalDuplicates },
  ];
});

const rarityStats = computed(() => {
  if (!userDetail.value) return [];
  const dist = userDetail.value.stats.rarityDistribution;
  const max = Math.max(...Object.values(dist), 1);
  return Object.entries(dist).map(([k, count]) => {
    const r = k as Rarity;
    const cfg = RARITY_CONFIG[r];
    return {
      rarity: r,
      label: cfg?.label || r,
      count,
      color: cfg?.color || '#909399',
      percent: Math.round((count / max) * 100),
    };
  });
});

// Ban dialog
const banDialogVisible = ref(false);
const banTarget = ref<UserListItem | null>(null);
const banForm = reactive({ reason: '' });
const banSubmitting = ref(false);

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function rarityLabel(r: Rarity) {
  return RARITY_CONFIG[r]?.label || r;
}
function rarityColor(r: Rarity) {
  return RARITY_CONFIG[r]?.color || '#909399';
}

function resetSearch() {
  searchForm.keyword = '';
  searchForm.isBanned = undefined;
  pagination.page = 1;
  fetchData();
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await usersApi.list({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      isBanned: searchForm.isBanned,
    });
    list.value = res.items;
    pagination.total = res.total;
  } catch (e: any) {
    ElMessage.error(e.message || '加载用户列表失败');
  } finally {
    loading.value = false;
  }
}

async function viewDetail(row: UserListItem) {
  detailVisible.value = true;
  detailLoading.value = true;
  try {
    userDetail.value = await usersApi.detail(row.id);
  } catch (e: any) {
    ElMessage.error(e.message || '加载用户详情失败');
    detailVisible.value = false;
  } finally {
    detailLoading.value = false;
  }
}

function handleBan(row: UserListItem, ban: boolean) {
  if (ban) {
    banTarget.value = row;
    banForm.reason = '';
    banDialogVisible.value = true;
  } else {
    // Unban directly
    ElMessageBox.confirm(
      `确定要解封用户「${row.nickname}」吗？`,
      '解封确认',
      { confirmButtonText: '确定解封', cancelButtonText: '取消', type: 'info' },
    ).then(async () => {
      try {
        await usersApi.ban(row.id, false);
        ElMessage.success('解封成功');
        fetchData();
      } catch (e: any) {
        ElMessage.error(e.message || '操作失败');
      }
    }).catch(() => {});
  }
}

async function confirmBan() {
  if (!banForm.reason.trim()) {
    ElMessage.warning('请填写封禁原因');
    return;
  }
  if (!banTarget.value) return;

  banSubmitting.value = true;
  try {
    await usersApi.ban(banTarget.value.id, true, banForm.reason);
    ElMessage.success('已封禁');
    banDialogVisible.value = false;
    fetchData();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    banSubmitting.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.users-page {
  max-width: 1200px;
}
.page-header {
  margin-bottom: 16px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.stat-box {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
.stat-box-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}
.stat-box-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
.rarity-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.rarity-line-label {
  width: 40px;
  font-size: 12px;
  color: #606266;
  flex-shrink: 0;
}
</style>
