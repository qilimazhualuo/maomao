<script setup>
import map3d from './map3d.vue'
import Menu from '@/components/menu.vue'
</script>

<template>
  <div class="about">
    <map3d />
  </div>
  <Menu />
</template>

<style>
.about {
  max-width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
}
</style>
