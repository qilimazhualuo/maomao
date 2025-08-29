<script setup>
import { onMounted, onUnmounted, getCurrentInstance, ref, provide } from 'vue'
import Map from '@/common/map3'
import Meature from '@/components/Meature.vue'
import MoveModel from '@/components/MoveModal.vue'
import radar from './radar.vue'
import Track from './track.vue'

const { proxy } = getCurrentInstance()

const visible = ref(false)
const showModal = (e) => {
    if (e.code !== 'Space') {
        return
    }
    visible.value = !visible.value
}
onMounted(() => {
    document.addEventListener('keydown', showModal)
})
onUnmounted(() => {
    document.removeEventListener('keydown', showModal)
})

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
    mapObj.map.loadMap({ mapType: 'tianditu', token: '2bbee26e4904189b1184091de22f3c68' })
    mapObj.map.loadTerrian('http://118.89.125.148:25300/terrain')
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
    mapObj.map.createPoint({
        longitude: 123,
        latitude: 32,
        img: '/map3d/mark.png',
        properties: {
            name: 'building1',
            model: '/map3d/soldier.glb',
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
    console.log(positions)
    mapObj.map.setClip({ positions })
}

const startDrawHole = () => {
    proxy.$refs.measureRef && proxy.$refs.measureRef.draw({ key: 'Polygon' })
    proxy.$refs.measureRef && proxy.$refs.measureRef.setDrawCallback(drawHole)
}
</script>

<template>
    <div class="map3d">
        <div class="map" ref="mapRef">
            <Meature v-if="mapOk" :map="mapObj.map" ref="measureRef" />
        </div>
    </div>
    <MoveModel
        v-if="mapOk"
        v-model:visible="visible"
        :footer="false"
        :mask="false"
        title="菜单"
        class="map3d-menu"
        :style="{ width: '300px', left: '10px', top: '10px' }"
    >
        <div class="map3d-menu-content">
            <a-collapse>
                <a-collapse-panel header="绘制洞">
                    <a-button @click="startDrawHole">点击绘制洞</a-button>
                </a-collapse-panel>
                <a-collapse-panel header="一些雷达">
                    <radar v-if="mapOk"/>
                </a-collapse-panel>
                <a-collapse-panel header="轨迹">
                    <Track v-if="mapOk"/>
                </a-collapse-panel>
                <a-collapse-panel header="流体">
                    <Track v-if="mapOk"/>
                </a-collapse-panel>
            </a-collapse>
        </div>
    </MoveModel>
</template>

<style lang="less">
.map3d {
    width: 100%;
    height: 100%;
    display: flex;
    .map {
        position: relative;
        width: 80%;
        height: 100%;
        flex: 1 1 auto;
        overflow: hidden;
    }
}
.map3d-menu {
    margin: 0;
    .map3d-menu-content {
        max-height: 60vh;
        overflow: auto;
    }
}
</style>
