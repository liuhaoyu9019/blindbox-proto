<template>
  <nav class="nav-bar">
    <div class="nav-left">
      <slot name="left">
        <button v-if="showBack" class="nav-btn" @click="$emit('back')">
          ←
        </button>
        <button v-else-if="showClose" class="nav-btn" @click="$emit('close')">
          ✕
        </button>
      </slot>
    </div>
    <div class="nav-center">
      <slot name="center">
        <span class="nav-title" v-if="title">{{ title }}</span>
      </slot>
    </div>
    <div class="nav-right">
      <slot name="right" />
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  showBack?: boolean
  showClose?: boolean
}>()

defineEmits<{
  back: []
  close: []
}>()
</script>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 var(--spacing-lg);
  background: transparent;
  position: relative;
  z-index: 10;
}
.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 60px;
}
.nav-right {
  justify-content: flex-end;
}
.nav-center {
  flex: 1;
  text-align: center;
}
.nav-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}
.nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-text);
  border-radius: 50%;
  transition: background var(--transition-fast);
}
.nav-btn:active {
  background: rgba(0,0,0,0.05);
}
</style>
