<script setup>
import map2d from './map2d.vue'
import map3d from './map3d.vue'
</script>

<template>
  <div class="about p-2">
    <div>
      <a-typography-title :level="2">2dmap绘制功能</a-typography-title>
      <map2d />
    </div>
    <div>
      <a-typography-title :level="2">3dmap绘制功能</a-typography-title>
      <map3d />
    </div>
  </div>
</template>

<style>
.about {
  max-width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
