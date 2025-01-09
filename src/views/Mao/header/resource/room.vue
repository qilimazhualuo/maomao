<script setup>
import { computed, getCurrentInstance } from 'vue'
import { PlusSquareOutlined } from '@ant-design/icons-vue'
import { useResourceStore } from '@/stores/resource'
import { config } from '@/config/mao_config'

const { proxy } = getCurrentInstance()

const resource = useResourceStore()

const canBuild = computed(() => {
  const { value } = config.room
  return Object.keys(value).every((key) => {
    return resource[key] >= value[key]
  })
})
const add = () => {
  resource.product('room')
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
  <a-col :span="24">
    <a-typography-title :level="3">
      <span>{{ $t('mao.room') }}</span>
      <a-tooltip :title="tooltip">
        <a-button class="ms-2 mr-2" :disabled="!canBuild" size="small" @click.stop="add">
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
      <a-button v-for="(item, idx) in resource.room" :key="item.id">{{ `${$t('mao.room')}${idx}` }}</a-button>
    </a-space>
  </a-col>
</template>

<style lang="less"></style>
