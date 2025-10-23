<script setup>
import { getCurrentInstance, onMounted, provide } from 'vue'
import Header from './header.vue'
import Scene from '@/common/three'
import skyBoxImg from './img/skyBox_cloud.jpg'
import { config } from '@/config/mao_config'

const { proxy } = getCurrentInstance()

const maomao = {
    scene: null,
    models: {
        houses: [
            {
                label: '森林小屋',
                url: '/models/house/forest_house.glb',
                author: 'peachyroyalty',
                origin: 'https://sketchfab.com/3d-models/forest-house-52429e4ef7bf4deda1309364a2cda86f',
                type: 'glb',
            },
        ],
    },
    // 添加建筑
    addModel(type) {
        return new Promise((resolve, reject) => {
            const { model } = config[type]
            this.scene
                ?.addGltf({ url: model, goView: true })
                .then((mesh) => {
                    resolve(mesh)
                })
                .catch((err) => {
                    console.error(err)
                    reject(err)
                })
        })
    },
}

provide('maomao', maomao)

onMounted(() => {
    maomao.scene = new Scene({ dom: proxy.$refs.scene, skybox: skyBoxImg })
    // maomao.scene.addBox({ width: 10, height: 10, depth: 10, color: "#fff0ff", position: { x: 0, y: 0, z: 5 } })
    maomao.scene.addPlane({ width: 100, height: 100, color: '#fff0ff' })
    maomao.scene.goView({ x: 10, y: 10, z: 10 }, 100)
    maomao.scene.addEvent({
        type: 'click',
        cb: (e) => {
            console.log('click', e)
        },
    })
})
</script>

<template>
    <div class="mao-container">
        <Header class="mao-header" />
        <div class="mao-scene" ref="scene"></div>
    </div>
</template>

<style lang="less">
.mao-container {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    .mao-header {
        z-index: 2;
    }
    .mao-scene {
        height: 20px;
        flex: 1 1 auto;
    }
}
</style>
