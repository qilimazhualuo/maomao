<script setup>
import { onMounted, getCurrentInstance, provide } from 'vue'
import Scene from '@/common/three'

const { proxy } = getCurrentInstance()

const building = {
    scene: null
}
provide('building', building)

onMounted(() => {
    building.scene = new Scene({ dom: proxy.$refs.scene })
    building.scene.addPlane({ width: 100, height: 100, color: "#fff0ff" })
    const { model } = proxy.$route.query
    building.scene.addGltf({
        url: model,
        goView: true,
        animate: false,
    }).then((scene) => {
        scene.gltf.scene.rotation.x = Math.PI / 2
    })
})
</script>

<template>
    <div class="building" ref="scene"></div>
</template>

<style lang="less">
.building {
    height: 100%;    
}
</style>