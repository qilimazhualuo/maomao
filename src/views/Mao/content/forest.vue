<script setup>
import { computed } from 'vue'
import { PlusSquareOutlined } from '@ant-design/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { config } from '@/config/mao_config'

const resource = useResourceStore()

const canBuild = computed(() => {
  const { value } = config.cropland
  return Object.keys(value).every((key) => {
    return resource[key] >= value[key]
  })
})
const add = () => {
  resource.product('forest')
}
</script>

<template>
  <a-col :span="24">
    <a-typography-title :level="3">
      <span>{{ $t('mao.forest') }}</span>
      <a-button class="ms-2" :disabled="!canBuild" size="small" @click.stop="add">
        <template #icon><PlusSquareOutlined /></template>
        {{ $t('mao.tipOfBuild') }}
      </a-button>
    </a-typography-title>
  </a-col>
  <a-col v-for="(item, idx) in resource.forest" :key="item.id">
    <a-button>{{ `${$t('mao.forest')}${idx}` }}</a-button>
  </a-col>
</template>

<style lang="less"></style>
