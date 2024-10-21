<script setup>
import { onMounted, getCurrentInstance } from 'vue'
import Map from '@/common/map3'

const { proxy } = getCurrentInstance()

let map

onMounted(() => {
  map = new Map({
    target: proxy.$refs.mapRef,
    center: [120, 30],
    zoom: 10,
  })
})
</script>

<template>
  <div class="map" ref="mapRef"></div>
</template>

<style lang="less" scoped>
.map {
  position: relative;
  height: 80vh;
}
</style>
