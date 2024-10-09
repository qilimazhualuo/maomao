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
  { label: proxy.$t('mao.all'), value: 'all' },
  { label: proxy.$t('mao.food'), value: 'food' },
  { label: proxy.$t('mao.wood'), value: 'wood' },
  { label: proxy.$t('mao.stone'), value: 'stone' },
  { label: proxy.$t('mao.gold'), value: 'gold' },
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
