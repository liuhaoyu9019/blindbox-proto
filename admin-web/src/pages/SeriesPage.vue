<template>
  <div class="series-page">
    <div class="page-header">
      <h2 class="page-title">系列管理</h2>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>新增系列
      </el-button>
    </div>

    <!-- Search -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="系列名称">
          <el-input v-model="searchForm.keyword" placeholder="搜索系列名称" clearable @clear="fetchData" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" stripe style="width: 100%" empty-text="暂无系列数据">
        <el-table-column prop="emoji" label="表情" width="70" align="center">
          <template #default="{ row }">
            <span style="font-size: 24px;">{{ row.emoji }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="系列名称" min-width="140" />
        <el-table-column prop="description" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column prop="itemCount" label="卡片数量" width="100" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" type="primary" link @click="viewItems(row)">
              <el-icon><View /></el-icon>卡片
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
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

    <!-- Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑系列' : '新增系列'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-width="80px"
        size="default"
      >
        <el-form-item label="系列名称" prop="name">
          <el-input v-model="editForm.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="封面 Emoji" prop="emoji">
          <el-input v-model="editForm.emoji" maxlength="2" placeholder="输入一个 emoji" />
        </el-form-item>
        <el-form-item label="系列简介" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEditing ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Edit, View, Delete } from '@element-plus/icons-vue';
import { seriesApi } from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { SeriesListItem } from '../types';

const router = useRouter();
const list = ref<SeriesListItem[]>([]);
const loading = ref(false);
const formRef = ref<FormInstance>();

const searchForm = reactive({ keyword: '' });
const pagination = reactive({ page: 1, pageSize: 20, total: 0 });

const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const submitting = ref(false);

const editForm = reactive({
  name: '',
  emoji: '',
  description: '',
});

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入系列名称', trigger: 'blur' },
    { max: 50, message: '名称不超过50字符', trigger: 'blur' },
  ],
  emoji: [{ required: true, message: '请输入封面 emoji', trigger: 'blur' }],
  description: [{ max: 500, message: '简介不超过500字符', trigger: 'blur' }],
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function resetSearch() {
  searchForm.keyword = '';
  pagination.page = 1;
  fetchData();
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await seriesApi.list({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
    });
    list.value = res.items;
    pagination.total = res.total;
  } catch (e: any) {
    ElMessage.error(e.message || '加载系列列表失败');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  isEditing.value = false;
  editingId.value = null;
  editForm.name = '';
  editForm.emoji = '';
  editForm.description = '';
  dialogVisible.value = true;
}

function openEdit(row: SeriesListItem) {
  isEditing.value = true;
  editingId.value = row.id;
  editForm.name = row.name;
  editForm.emoji = row.emoji;
  editForm.description = row.description;
  dialogVisible.value = true;
}

function viewItems(row: SeriesListItem) {
  router.push(`/series/${row.id}/items`);
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await seriesApi.update(editingId.value, {
        name: editForm.name,
        emoji: editForm.emoji,
        description: editForm.description,
      });
      ElMessage.success('更新成功');
    } else {
      await seriesApi.create({
        name: editForm.name,
        emoji: editForm.emoji,
        description: editForm.description,
      });
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    fetchData();
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(row: SeriesListItem) {
  try {
    await ElMessageBox.confirm(
      `确定要删除系列「${row.name}」吗？如果系列下有卡片则无法删除。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
    );
    await seriesApi.delete(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (e: any) {
    if (e?.toString().includes('cancel')) return;
    ElMessage.error(e.message || '删除失败');
  }
}

onMounted(fetchData);
</script>

<style scoped>
.series-page {
  max-width: 1200px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style>
