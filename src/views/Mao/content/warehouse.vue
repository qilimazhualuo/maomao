<script setup>
import { computed, getCurrentInstance } from 'vue'
import { PlusSquareOutlined } from '@ant-design/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { config } from '@/config/mao_config'

const { proxy } = getCurrentInstance()

const resource = useResourceStore()

const canBuild = computed(() => {
  const { value } = config.warehouse
  return Object.keys(value).every((key) => {
    return resource[key] >= value[key]
  })
})
const add = () => {
  resource.product('warehouse')
}

const options = [
  { label: '全部', value: 'all' },
  { label: '食物', value: 'food' },
  { label: '木材', value: 'wood' },
  { label: '石头', value: 'stone' },
  { label: '金币', value: 'gold' },
]

const tooltip = computed(() => {
  const buildResource = config.warehouse.value
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
      <span>{{ $t('mao.warehouse') }}</span>
      <a-tooltip :title="tooltip">
        <a-button class="ms-2" :disabled="!canBuild" size="small" @click.stop="add">
          <template #icon><PlusSquareOutlined /></template>
          {{ $t('mao.tipOfBuild') }}
        </a-button>
      </a-tooltip>
    </a-typography-title>
  </a-col>
  <a-col v-for="(item, idx) in resource.warehouses" :key="item.id">
    <a-segmented v-model:value="item.storeType" :options="options" />
  </a-col>
</template>

<style lang="less"></style>
