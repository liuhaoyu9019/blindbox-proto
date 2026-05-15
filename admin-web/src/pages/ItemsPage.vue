<template>
  <div class="items-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">卡片管理</h2>
        <p v-if="seriesInfo" class="page-subtitle">
          系列：{{ seriesInfo.emoji }} {{ seriesInfo.name }}
        </p>
      </div>
      <el-button type="primary" @click="openCreate">
        <el-icon><Plus /></el-icon>新增卡片
      </el-button>
    </div>

    <!-- Filters -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-form :inline="true" size="default">
        <el-form-item label="卡片名称">
          <el-input v-model="searchForm.keyword" placeholder="搜索卡片" clearable @clear="fetchData" @keyup.enter="fetchData" />
        </el-form-item>
        <el-form-item label="稀有度">
          <el-select v-model="searchForm.rarity" placeholder="全部" clearable style="width: 120px;" @change="fetchData">
            <el-option v-for="r in rarityOptions" :key="r.value" :label="r.label" :value="r.value" />
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
      <el-table :data="list" v-loading="loading" stripe style="width: 100%" empty-text="暂无卡片数据">
        <el-table-column prop="seriesIndex" label="编号" width="70" align="center" />
        <el-table-column prop="emoji" label="表情" width="60" align="center">
          <template #default="{ row }">
            <span style="font-size: 22px;">{{ row.emoji }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="卡片名称" min-width="140" />
        <el-table-column prop="subtitle" label="副标题" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.subtitle || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="稀有度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :color="rarityColor(row.rarity)" effect="dark" size="small" style="color:#fff;">
              {{ rarityLabel(row.rarity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="imageUrl" label="图片" width="80" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              style="width: 40px; height: 40px; border-radius: 4px;"
              fit="cover"
              :preview-src-list="[row.imageUrl]"
              preview-teleported
            />
            <span v-else style="color:#ccc;">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @change="fetchData"
        />
      </div>
    </el-card>

    <!-- Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑卡片' : '新增卡片'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="editForm"
        :rules="formRules"
        label-width="80px"
        size="default"
      >
        <el-form-item label="卡片名称" prop="name">
          <el-input v-model="editForm.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="editForm.subtitle" maxlength="50" show-word-limit placeholder="可选" />
        </el-form-item>
        <el-form-item label="Emoji" prop="emoji">
          <el-input v-model="editForm.emoji" maxlength="2" placeholder="输入一个 emoji" style="width: 120px;" />
        </el-form-item>
        <el-form-item label="稀有度" prop="rarity">
          <el-select v-model="editForm.rarity" placeholder="选择稀有度" style="width: 150px;">
            <el-option v-for="r in rarityOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="系列编号" prop="seriesIndex">
          <el-input-number v-model="editForm.seriesIndex" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="卡片图片">
          <div class="upload-wrap">
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/jpeg,image/png,image/webp,image/gif"
              :on-change="handleFileChange"
            >
              <el-button size="small" type="primary">选择图片</el-button>
            </el-upload>
            <span v-if="editForm.imageUrl" class="upload-hint">已上传</span>
            <el-image
              v-if="previewUrl"
              :src="previewUrl"
              style="width: 60px; height: 60px; border-radius: 4px; margin-left: 12px;"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="卡片描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" maxlength="1000" show-word-limit placeholder="可选" />
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
import { useRoute } from 'vue-router';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { itemsApi } from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules, UploadRawFile, UploadFile } from 'element-plus';
import type { Item, Rarity } from '../types';
import { RARITY_CONFIG } from '../types';

const route = useRoute();
const seriesId = route.params.id as string;

const list = ref<Item[]>([]);
const loading = ref(false);
const formRef = ref<FormInstance>();
const seriesInfo = ref<{ emoji: string; name: string } | null>(null);

const searchForm = reactive({ keyword: '', rarity: '' as Rarity | '' });
const pagination = reactive({ page: 1, pageSize: 20, total: 0 });
// Track whether there is a pending upload to send to API
const pendingUploadFile = ref<File | null>(null);
const previewUrl = ref<string>('');

const dialogVisible = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const submitting = ref(false);

const editForm = reactive({
  name: '',
  subtitle: '',
  emoji: '',
  rarity: '' as Rarity | '',
  seriesIndex: 1,
  imageUrl: '',
  description: '',
});

const rarityOptions = Object.entries(RARITY_CONFIG).map(([k, v]) => ({
  value: k,
  label: v.label,
}));

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入卡片名称', trigger: 'blur' },
    { max: 50, message: '名称不超过50字符', trigger: 'blur' },
  ],
  emoji: [{ required: true, message: '请输入 emoji', trigger: 'blur' }],
  rarity: [{ required: true, message: '请选择稀有度', trigger: 'change' }],
  seriesIndex: [{ required: true, message: '请输入系列编号', trigger: 'blur' }],
};

function rarityLabel(r: Rarity) {
  return RARITY_CONFIG[r]?.label || r;
}
function rarityColor(r: Rarity) {
  return RARITY_CONFIG[r]?.color || '#909399';
}

function resetSearch() {
  searchForm.keyword = '';
  searchForm.rarity = '';
  pagination.page = 1;
  fetchData();
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await itemsApi.list(seriesId, {
      page: pagination.page,
      pageSize: pagination.pageSize,
      rarity: (searchForm.rarity as string) || undefined,
      keyword: searchForm.keyword || undefined,
    });
    list.value = res.items;
    pagination.total = res.total;
  } catch (e: any) {
    ElMessage.error(e.message || '加载卡片列表失败');
  } finally {
    loading.value = false;
  }
}

async function handleFileChange(uploadFile: UploadFile) {
  const file = uploadFile.raw as UploadRawFile;
  if (!file) return;

  // Validate file type and size
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    ElMessage.error('仅支持 JPG/PNG/WebP/GIF 格式');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片不能超过 5MB');
    return;
  }

  // Show local preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  // Upload immediately
  try {
    const res = await itemsApi.uploadImage(file);
    editForm.imageUrl = res.url;
    pendingUploadFile.value = null;
    ElMessage.success('图片上传成功');
  } catch (e: any) {
    ElMessage.error(e.message || '图片上传失败');
  }
}

function openCreate() {
  isEditing.value = false;
  editingId.value = null;
  editForm.name = '';
  editForm.subtitle = '';
  editForm.emoji = '';
  editForm.rarity = '';
  editForm.seriesIndex = 1;
  editForm.imageUrl = '';
  editForm.description = '';
  previewUrl.value = '';
  pendingUploadFile.value = null;
  dialogVisible.value = true;
}

function openEdit(row: Item) {
  isEditing.value = true;
  editingId.value = row.id;
  editForm.name = row.name;
  editForm.subtitle = row.subtitle || '';
  editForm.emoji = row.emoji;
  editForm.rarity = row.rarity;
  editForm.seriesIndex = row.seriesIndex;
  editForm.imageUrl = row.imageUrl || '';
  editForm.description = row.description || '';
  previewUrl.value = row.imageUrl || '';
  pendingUploadFile.value = null;
  dialogVisible.value = true;
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (isEditing.value && editingId.value) {
      await itemsApi.update(editingId.value, {
        name: editForm.name,
        subtitle: editForm.subtitle || undefined,
        emoji: editForm.emoji,
        rarity: editForm.rarity as Rarity,
        imageUrl: editForm.imageUrl || undefined,
        description: editForm.description || undefined,
        seriesIndex: editForm.seriesIndex,
      });
      ElMessage.success('更新成功');
    } else {
      await itemsApi.create({
        seriesId,
        name: editForm.name,
        subtitle: editForm.subtitle || undefined,
        emoji: editForm.emoji,
        rarity: editForm.rarity as Rarity,
        imageUrl: editForm.imageUrl || undefined,
        description: editForm.description || undefined,
        seriesIndex: editForm.seriesIndex,
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

async function handleDelete(row: Item) {
  try {
    await ElMessageBox.confirm(
      `确定要删除卡片「${row.name}」吗？`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
    );
    await itemsApi.delete(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (e: any) {
    if (e?.toString().includes('cancel')) return;
    ElMessage.error(e.message || '删除失败');
  }
}

onMounted(async () => {
  // Get series info from route meta or just fetch items
  fetchData();
});
</script>

<style scoped>
.items-page {
  max-width: 1200px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #909399;
}
.pagination-wrap {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.upload-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.upload-hint {
  font-size: 12px;
  color: #67c23a;
}
</style>
