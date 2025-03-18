<script setup>
import { provide } from 'vue'
import Header from './header.vue'
import Content from './content.vue'

const maomao = {
    scene: null,
    models: {
        houses: [
            {
                label: '森林小屋',
                url: '/models/house/forest_house.glb',
                author: 'peachyroyalty',
                origin: 'https://sketchfab.com/3d-models/forest-house-52429e4ef7bf4deda1309364a2cda86f',
                type: 'glb'
            }
        ]
    },
    // 添加建筑
    addModel(url) {
        return new Promise((resolve) => {
            const model = this.scene.addModel(url)
            resolve(model)
        })
    },
}

provide('maomao', maomao)

</script>

<template>
    <div class="mao-container">
        <Header class="mao-header" />
        <Content class="mao-content" />
    </div>
</template>

<style lang="less" scoped>
.mao-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .mao-content {
        height: 2px;
        flex: 1 1 auto;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 24px 36px -28px inset;
        overflow: hidden;
    }
}
</style>
