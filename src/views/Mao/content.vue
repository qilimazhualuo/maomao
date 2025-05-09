<script setup>
import { computed, getCurrentInstance, onMounted, inject } from 'vue'
import Scene from '@/common/three'
import { modelConfig } from './config.js'
import skyBoxImg from './img/skyBox_cloud.jpg'

const props = defineProps({
    class: {
        type: String,
        default: '',
    },
})

const { proxy } = getCurrentInstance()

const className = computed(() => `content ${props.class}`)

const maomao = inject('maomao')

onMounted(() => {
    maomao.scene = new Scene({ dom: proxy.$refs.scene })
    maomao.scene.addBox({ width: 10, height: 10, depth: 10, color: "#fff0ff", position: { x: 0, y: 0, z: 5 } })
    // window.plane = maomao.scene.addPlane({ width: 100, height: 100, color: "#fff0ff" })
    maomao.scene.goView({ x: 10, y: 10, z: 10 }, 100)
    // maomao.scene.addGltf({
    //     url: '/model/maomao/ground.glb',
    //     goView: true,
    //     noAdd: false
    // }).then(({ gltf }) => {
    //     console.log(gltf)
    // })
    // modelConfig.forEach((layer) => {
    //     layer.children.forEach((item) => {
    //         if (item.visible) {
    //             maomao.scene.addGltf({
    //                 url: item.url
    //             }).then(({ gltf }) => {
    //                 console.log(gltf)
    //             })
    //         }
    //     })
    // })
})
</script>

<template>
    <div :class="className" ref="scene"></div>
</template>

<style lang="less" scoped>
.content {
    background-color: aliceblue;

    .left,
    .right {
        height: 100%;
        overflow: auto;
    }
}
</style>
