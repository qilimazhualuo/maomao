<script setup>
import { RouterLink, RouterView } from 'vue-router'
import '@/stores/resource'
</script>

<template>
  <div class="content">
    <RouterView />
  </div>
</template>

<style scoped>

.content {
  height: 2px;
  flex: 1 1 auto;
}
</style>
