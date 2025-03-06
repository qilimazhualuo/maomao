<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import room from './room.vue'
import cropland from './cropland.vue'
import forest from './forest.vue'
import mine from './mine.vue'
import sawmill from './sawmill.vue'
import alchemy from './alchemy.vue'
import warehouse from './warehouse.vue'
import market from './market.vue'

import { useResourceStore } from '@/stores/resource'

const resource = useResourceStore()

const open = ref(false)

const showModal = (e) => {
    if (e.key === 'b') {
        open.value = !open.value
    }
}

onMounted(() => {
    document.addEventListener('keydown', showModal)
})

onUnmounted(() => {
    document.removeEventListener('keydown', showModal)
})

const foodColor = computed(() => {
    if (resource.food > resource.warehouseStore.food * 0.9) {
        return 'green'
    } else if (resource.food < resource.warehouseStore.food * 0.1) {
        return 'red'
    } else {
        return 'blue'
    }
})

const woodColor = computed(() => {
    if (resource.wood > resource.warehouseStore.wood * 0.9) {
        return 'green'
    } else if (resource.wood < resource.warehouseStore.wood * 0.1) {
        return 'red'
    } else {
        return 'blue'
    }
})

const stoneColor = computed(() => {
    if (resource.stone > resource.warehouseStore.stone * 0.9) {
        return 'green'
    } else if (resource.stone < resource.warehouseStore.stone * 0.1) {
        return 'red'
    } else {
        return 'blue'
    }
})

const goldColor = computed(() => {
    if (resource.gold > resource.warehouseStore.gold * 0.9) {
        return 'green'
    } else if (resource.gold < resource.warehouseStore.gold * 0.1) {
        return 'red'
    } else {
        return 'blue'
    }
})
</script>

<template>
    <a-button size="small" type="dashed" @click.stop="open = true">{{ $t('mao.warehouse') }}</a-button>
    <a-modal v-model:open="open" title="仓库资源" width="80vw" :footer="false" centered
        :bodyStyle="{ height: '70vh', overflow: 'auto' }">
        <a-row class="h-100">
            <a-col :span="12" class="left h-100 overflow">
                <a-row :gutter="[0, 8]">
                    <room />
                    <cropland />
                    <forest />
                    <sawmill />
                    <mine />
                    <alchemy />
                    <market />
                </a-row>
            </a-col>
            <a-col :span="12" class="right h-100 overflow ps-2">
                <a-row>
                    <!-- 资源 -->
                    <a-descriptions bordered :title="$t('mao.resource')" :column="2" layout="vertical" size="small">
                        <a-descriptions-item :label="$t('mao.food')">
                            <a-tag :color="foodColor">{{ `${resource.food} / ${resource.warehouseStore.food}` }}</a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item :label="$t('mao.wood')">
                            <a-tag :color="woodColor">{{ `${resource.wood} / ${resource.warehouseStore.wood}` }}</a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item :label="$t('mao.stone')">
                            <a-tag :color="stoneColor">{{ `${resource.stone} / ${resource.warehouseStore.stone}`
                                }}</a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item :label="$t('mao.gold')">
                            <a-tag :color="goldColor">{{ `${resource.gold} / ${resource.warehouseStore.gold}` }}</a-tag>
                        </a-descriptions-item>
                    </a-descriptions>
                    <!-- 人口 -->

                    <!-- 仓库 -->
                    <warehouse />
                </a-row>
            </a-col>
        </a-row>
    </a-modal>
</template>

<style lang="less"></style>