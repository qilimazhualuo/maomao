<script setup>
import { RouterLink, RouterView } from 'vue-router'
import '@/stores/resource'
import Menu from '@/components/menu.vue'

</script>

<template>
  <div class="content">
    <RouterView />
  </div>
  <Menu />
</template>

<style scoped>

.content {
  height: 2px;
  flex: 1 1 auto;
}
</style>
