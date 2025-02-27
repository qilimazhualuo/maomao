<script setup>
import { onMounted, watch, getCurrentInstance } from 'vue'
import Map from 'map-ol'

const props = defineProps({
    value: {
        type: Array,
        default: () => ([])
    }
})
const emit = defineEmits(['update:value'])

const { proxy } = getCurrentInstance()

let map

onMounted(() => {
    map = new Map({
        target: proxy.$refs.mapRef,
        center: [120, 30],
        zoom: 10
    })
    map.loadMap('gaode')
    map.setMeatureCallBack(({ features }) => {
        emit('update:value', features[0].geometry.coordinates)
    })
    map.addEvent('click', ({ coordinate }) => {
        emit('update:value', props.value.concat([coordinate]))
    })
})

watch(() => props.value, (val, oldVal) => {
    map.clearMeature()
    if (val.length === 0) return
    map.setMeatureGeojson({
        type: 'LineString',
        coordinates: val
    })
})
</script>

<template>
    <div class="border radius w-2-3" ref="mapRef">
    </div>
</template>

<style lang="less">

</style>