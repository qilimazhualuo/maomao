<script setup>
import Map from '@/common/map'
import { ref, onMounted, watch, getCurrentInstance, nextTick } from 'vue'
import MarkImg from './mark.png'

const proxy = getCurrentInstance().proxy

const open = ref(false)

let map, callback, layerId

const initMap = () => {
    return new Promise((resolve) => {
        if (map) {
            return resolve()
        }
        nextTick(() => {
            map = new Map({
                target: proxy.$refs.mapRef,
                center: [120, 30],
                zoom: 10
            })
            map.loadMap('gaode')
            map.addEvent('click', ({ coordinate }) => {
                const [longitude, latitude] = coordinate
                callback({ longitude: longitude.toFixed(6), latitude: latitude.toFixed(6) })
                open.value = false
            })
            layerId = map.createLayer()
            resolve()
        })
    })
}

const show = async (coors, fun) => {
    callback = fun
    open.value = true
    await initMap()
    map.clearLayer(layerId)
    setCenter(coors)
}

const setCenter = (val) => {
    const { longitude, latitude } = val
    if (longitude && latitude) {
        map.setViewRange([Number(longitude), Number(latitude)], { duration: 250, maxZoom: 12 })
        map.createPoint({ longitude, latitude }, layerId)
    }
}

const showRoute = async (route) => {
    open.value = true
    await initMap()
    map.clearLayer(layerId)
    map.createLine({
        data: route,
        layerId,
        goView: true
    })
}

defineExpose({
    show,
    showRoute
})

</script>

<template>
    <a-modal v-model:open="open" title="确定位置" :footer="false" centered wrapClassName="location-modal" width="70vw">
        <div class="location-map" ref="mapRef"></div>
    </a-modal>
</template>

<style lang="less">
.location-modal {
    .location-map {
        width: 100%;
        height: 70vh;
    }
}
</style>