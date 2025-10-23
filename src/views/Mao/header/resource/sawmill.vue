<script setup>
import { computed, getCurrentInstance, inject } from 'vue'
import { PlusSquareOutlined } from '@ant-design/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { config } from '@/config/mao_config'

defineProps({
    open: Boolean,
})
const emit = defineEmits(['update:open'])

const { proxy } = getCurrentInstance()

const resource = useResourceStore()

const canBuild = computed(() => {
    const { value } = config.sawmill
    return Object.keys(value).every((key) => {
        return resource[key] >= value[key]
    })
})

const maomao = inject('maomao')
const add = () => {
    resource.product('sawmill')
    maomao.addModel('sawmill').then(() => {
        emit('update:open', true)
    })
}

const tooltip = computed(() => {
    const buildResource = config.room.value
    return Object.keys(buildResource)
        .map((resource) => {
            return `${proxy.$t('mao.' + resource)} : ${buildResource[resource]}`
        })
        .join(' ')
})
</script>

<template>
    <a-col>
        <a-typography-title :level="3">
            <span>{{ $t('mao.sawmill') }}</span>
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
            <a-button v-for="(item, idx) in resource.sawmill" :key="item.id">{{
                `${$t('mao.sawmill')}${idx}`
            }}</a-button>
        </a-space>
    </a-col>
</template>

<style lang="less"></style>
