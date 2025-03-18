<script setup>
import { computed, getCurrentInstance, onMounted, inject } from 'vue'
import Scene from '@/common/three'

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
    maomao.scene.addPlane({ width: 100, height: 100, color: "#fff0ff" })
    maomao.scene.goView({ x: 10, y: 10, z: 10 }, 100)
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
