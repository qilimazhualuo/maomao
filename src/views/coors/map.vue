<script setup>
import { onMounted, watch } from 'vue'
import Map from '@/common/map'

const props = defineProps({
    value: {
        type: Array,
        default: () => ([])
    }
})
const emit = defineEmits(['update:value'])

let map, layerId = 'coors-layer'

onMounted(() => {
    map = new Map({
        id: 'coors-map',
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
    // if (JSON.stringify(val) === JSON.stringify(oldVal)) return
    map.clearMeature()
    if (val.length === 0) return
    map.setMeatureGeojson({
        type: 'LineString',
        coordinates: val
    })
    // map.createLine({ data: val, layerId, goView: true })
})
</script>

<template>
    <div class="border radius w-2-3" id="coors-map">
    </div>
</template>

<style lang="less">

</style>