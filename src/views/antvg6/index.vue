<script setup>
import { Graph } from '@antv/g6'
import { ref, getCurrentInstance, onMounted } from 'vue'

const { proxy } = getCurrentInstance()

onMounted(() => {
    const { width, height } = proxy.$refs.container
    const graph = new Graph({
        container: proxy.$refs.container,
        width,
        height,
        data: {
            nodes: [
                {
                    id: 'node-1',
                    style: { x: 50, y: 100 },
                },
                {
                    id: 'node-2',
                    style: { x: 150, y: 100 },
                },
            ],
            edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2' }],
        },
        behaviors: [
            'drag-canvas',
            'zoom-canvas',
            'drag-element',
            'click-select',
            'hover-expand',
            'create-edge',
            'edge-update',
            'edge-delete',
            'edge-update',
        ]
    })
    graph.render()
})
</script>

<template>
    <div ref="container" class="container"></div>
</template>

<style lang="less">
.container {
    width: 100%;
    height: 100%;
}
</style>