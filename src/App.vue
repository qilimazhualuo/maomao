<script setup>
import { RouterLink, RouterView } from 'vue-router'
import '@/stores/resource'
import { invoke } from '@tauri-apps/api/core'
import Menu from '@/components/menu.vue'

invoke('http_request', { url: 'http://www.bai.com', options: { method: 'get' } }).then((res) => {
  console.log('get success', res)
}).catch((err) => {
  console.log('get error', err)
})

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
