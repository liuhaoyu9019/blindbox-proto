<template>
  <div v-if="visible" class="toast" :class="[type]">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  message: string
  type?: 'info' | 'success' | 'error'
  duration?: number
}>(), {
  type: 'info',
  duration: 2000,
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)

watch(() => props.message, (val) => {
  if (val) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('close')
    }, props.duration)
  }
}, { immediate: true })
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-caption);
  font-weight: 500;
  z-index: 1000;
  white-space: nowrap;
  animation: toastIn 0.3s ease;
  box-shadow: var(--shadow-md);
}
.toast.info {
  background: rgba(0,0,0,0.8);
  color: #fff;
}
.toast.success {
  background: #B8C9B8;
  color: #1C1C1E;
}
.toast.error {
  background: #E8A8A8;
  color: #fff;
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
