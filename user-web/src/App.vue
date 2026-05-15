<template>
  <router-view v-slot="{ Component, route }">
    <transition name="slide-up" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
// App shell — transitions handled by router-view
</script>
