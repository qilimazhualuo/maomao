<script setup>
import { onMounted, getCurrentInstance, ref } from 'vue'
import Map from '@/common/map3'
import Meature from '@/components/Meature.vue'
import radar from './radar.vue'

const { proxy } = getCurrentInstance()

let map
const mapOk = ref(false)
onMounted(() => {
    map = new Map({
        target: proxy.$refs.mapRef,
        center: [120, 30],
        zoom: 10,
    })
    map.loadMap('gaode')
    mapOk.value = true
})
</script>

<template>
    <div class="menu p-2">
        <a-typography-title :level="2">3dmap绘制功能</a-typography-title>
        <a-typography-paragraph>
            鼠标悬浮到地图右上角的 <a-typography-text strong>绘制</a-typography-text> 按钮，选择绘制功能，
            即可在地图上绘制点、线、面、圆等图形，并支持编辑和删除。
        </a-typography-paragraph>
        <a-typography-title :level="2">自定义primitive</a-typography-title>
        <radar v-if="mapOk" :map="map"/>
    </div>
    <div class="map" ref="mapRef">
        <Meature v-if="mapOk" :map="map" />
    </div>
</template>

<style lang="less" scoped>
.menu {
    width: 20%;
    max-width: 300px;
    box-shadow: inset 0 0 10px #ccc;
    height: 100%;
    overflow: auto;
    background-color: #6f717845;
}
.map {
    position: relative;
    width: 80%;
    height: 100%;
    flex: 1 1 auto;
}
</style>
