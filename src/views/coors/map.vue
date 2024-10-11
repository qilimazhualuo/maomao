<script setup>
import { onMounted, watch } from 'vue'
import Map from '@/common/map'

const props = defineProps({
    value: {
        type: Array,
        default: () => ([])
    }
})
defineEmits(['update:value'])

let map, layerId = 'coors-layer'

onMounted(() => {
    map = new Map({
        id: 'coors-map',
        center: [120, 30],
        zoom: 10
    })
    map.loadMap('gaode')
    map.createLayer({ id: layerId })
})

watch(() => props.value, (val) => {
    map.clearLayer(layerId)
    map.createLine({ data: val, layerId, goView: true })
})
</script>

<template>
    <div class="border radius w-2-3" id="coors-map">
    </div>
</template>

<style lang="less">

</style>