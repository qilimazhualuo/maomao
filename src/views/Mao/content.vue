<script setup>
import { computed } from 'vue'
import { PlusSquareOutlined } from '@ant-design/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { config } from '@/config/mao_config'

const resource = useResourceStore()

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})

const className = computed(() => `header ${props.class}`)

// 房屋
const canBuildRoom = computed(() => {
  const { value, buildTime, resourceType } = config.room
  return Object.keys(value).every((key) => {
    return resource[`${key}s`] >= value[key]
  })
})
const addRoom = () => {
  resource.product('room')
}
</script>

<template>
  <div :class="className">
    <a-row :gutter="[8, 8]">
      <a-col :span="24">
        <a-typography-title :level="3">{{ $t('mao.room') }}</a-typography-title>
      </a-col>
      <a-col v-for="(item, idx) in resource.rooms" :key="item.id">
        <a-button>{{ `房屋${idx}` }}</a-button>
      </a-col>
      <a-col :span="24">
        <a-button block :disabled="!canBuildRoom" @click.stop="addRoom">
          <template #icon><PlusSquareOutlined /></template>
          {{ $t('mao.tipOfBuild') }}
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="less" scoped>
.header {
  padding: 0 calc(0.2rem + 8px);
}
</style>
