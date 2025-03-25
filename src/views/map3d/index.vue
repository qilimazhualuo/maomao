<script setup>
import { onMounted, getCurrentInstance, ref, provide } from 'vue'
import Map from '@/common/map3'
import Meature from '@/components/Meature.vue'
import radar from './radar.vue'
import Track from './track.vue'

const { proxy } = getCurrentInstance()

const mapOk = ref(false)

const mapObj = {
    map: null,
    models: [
        { label: '苏57', value: '/map3d/su-57.glb' }
    ]
}
provide('mapObj', mapObj)

onMounted(() => {
    mapObj.map = new Map({
        target: proxy.$refs.mapRef,
        center: [120, 30],
        zoom: 10,
    })
    mapObj.map.loadMap('gaode')
    const layerId = mapObj.map.createLayer()
    mapObj.map.createPoint({
        longitude: 120,
        latitude: 30,
        img: '/map3d/mark.png',
        properties: {
            name: 'building',
            model: '/map3d/su-57.glb',
        }
    }, layerId)
    mapObj.map.addEvent('click', ({ properties }) => {
        const { name, model } = properties
        proxy.$router.push({
            name,
            query: {
                model
            }
        })
    }, layerId)
    mapOk.value = true
})

const drawHole = ({ geojson }) => {
    proxy.$refs.measureRef && proxy.$refs.measureRef.setDrawCallback(undefined)
    proxy.$refs.measureRef && proxy.$refs.measureRef.clear()
    const feature = geojson.features.find(i => i.geometry.type === 'Polygon')
    if (!feature) {
        return
    }
    const positions = feature.geometry.coordinates[0].map((coor) => {
        coor[2] = -10
        return coor
    })
    map.setClip({ positions })
}

const startDrawHole = () => {
    proxy.$refs.measureRef && proxy.$refs.measureRef.draw({ key: 'Polygon' })
    proxy.$refs.measureRef && proxy.$refs.measureRef.setDrawCallback(drawHole)
}
</script>

<template>
    <div class="map3d">
        <div class="menu p-2">
            <a-collapse>
                <a-collapse-panel header="绘制">
                    <a-typography-title :level="2">3dmap绘制功能</a-typography-title>
                    <a-typography-paragraph>
                        鼠标悬浮到地图右上角的 <a-typography-text strong>绘制</a-typography-text> 按钮，选择绘制功能，
                        即可在地图上绘制点、线、面、圆等图形，并支持编辑和删除。
                    </a-typography-paragraph>
                    <a-button @click="startDrawHole">点击绘制洞</a-button>
                </a-collapse-panel>
                <a-collapse-panel header="一些雷达">
                    <radar v-if="mapOk"/>
                </a-collapse-panel>
                <a-collapse-panel header="轨迹">
                    <Track v-if="mapOk"/>
                </a-collapse-panel>
            </a-collapse>
        </div>
        <div class="map" ref="mapRef">
            <Meature v-if="mapOk" :map="mapObj.map" ref="measureRef" />
        </div>
    </div>

</template>

<style lang="less" scoped>
.map3d {
    width: 100%;
    height: 100%;
    display: flex;
}
.menu {
    width: 20%;
    max-width: 300px;
    min-width: 200px;
    box-shadow: inset 0 0 10px #ccc;
    height: 100%;
    overflow: auto;
    background-color: #6f717845;
    :deep(.ant-form-item) {
        margin-bottom: 12px;
    }
}

.map {
    position: relative;
    width: 80%;
    height: 100%;
    flex: 1 1 auto;
    overflow: hidden;
}
</style>
