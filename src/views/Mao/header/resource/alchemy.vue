<script setup>
import { computed, getCurrentInstance } from 'vue'
import { PlusSquareOutlined } from '@ant-design/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { config } from '@/config/mao_config'

const { proxy } = getCurrentInstance()

const resource = useResourceStore()

const canBuild = computed(() => {
    const { value } = config.alchemy
    return Object.keys(value).every((key) => {
        return resource[key] >= value[key]
    })
})
const add = () => {
    resource.product('alchemy')
}

const tooltip = computed(() => {
    const buildResource = config.alchemy.value
    return Object.keys(buildResource)
        .map((resource) => {
            return `${proxy.$t('mao.' + resource)} : ${buildResource[resource]}`
        })
        .join(' ')
})
</script>

<template>
    <a-col :span="24">
        <a-typography-title :level="3">
            <span>{{ $t('mao.alchemy') }}</span>
            <a-tooltip :title="tooltip">
                <a-button class="ms-2" :disabled="!canBuild" size="small" @click.stop="add">
                    <template #icon>
                        <PlusSquareOutlined />
                    </template>
                    {{ $t('mao.tipOfBuild') }}
                </a-button>
            </a-tooltip>
        </a-typography-title>
    </a-col>
    <a-col :span="24">
        <a-space wrap>
            <a-button v-for="(item, idx) in resource.alchemy" :key="item.id">{{ `${$t('mao.alchemy')}${idx}`
                }}</a-button>
        </a-space>
    </a-col>
</template>

<style lang="less"></style>
