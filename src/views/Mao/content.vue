<script setup>
import { computed, getCurrentInstance, onMounted, inject } from 'vue'
import Scene from '@/common/three'
import skyBoxImg from './img/skyBox_cloud.jpg'

const props = defineProps({
    class: {
        type: String,
        default: '',
    },
})

const { proxy } = getCurrentInstance()

const className = computed(() => `mao-content ${props.class}`)

const maomao = inject('maomao')

onMounted(() => {
    maomao.scene = new Scene({ dom: proxy.$refs.scene, skybox: skyBoxImg })
    maomao.scene.addBox({ width: 10, height: 10, depth: 10, color: "#fff0ff", position: { x: 0, y: 0, z: 5 } })
    maomao.scene.addPlane({ width: 100, height: 100, color: "#fff0ff" })
    maomao.scene.goView({ x: 10, y: 10, z: 10 }, 100)
    maomao.scene.addEvent({
        type: 'click',
        cb: (e) => {
            console.log('click', e)
        }
    })
    maomao.scene.addOverLay({
        dom: proxy.$refs.box,
        position: { x: 0, y: 0, z: 0 },
    })
    maomao.scene.addOverLay({
        dom: proxy.$refs.box1,
        position: { x: 10, y: 0, z: 0 },
    })
})
</script>

<template>
    <div :class="className" ref="scene"></div>
    <div ref="box" class="mao-overlay">
        <h1>111111111111111</h1>
    </div>
    <div ref="box1" class="mao-overlay">
        <h1>2222222222222222222</h1>
    </div>
</template>

<style lang="less">
.mao-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100px;
    height: 200px;
    background-color: rgba(199, 28, 28, 0.9);
}
</style>
