<script setup>
import tech from './header/tech.vue'
import { computed, ref } from 'vue'

import { useResourceStore } from '@/stores/resource'

const resource = useResourceStore()

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})

const className = computed(() => `header ${props.class}`)

const happy = ref(92)

const happyColor = computed(() => {
  const red = 255 - 5.1 * happy.value
  const green = 5.1 * happy.value - 255
  const blue = -0.102 * Math.pow(happy.value, 2)
  return `rgb(${red < 0 ? 0 : red}, ${green < 0 ? 0 : green}, ${
    blue < 0 ? 0 : blue
  })`
})
</script>

<template>
  <div :class="className">
    <div class="status">
      <a-menu mode="horizontal" size="small" :selectable="false">
        <a-menu-item>
          <span class="label">{{ $t('mao.happy') }}</span>
          <a-tag :color="happyColor">{{ happy }}%</a-tag>
        </a-menu-item>
        <a-menu-item>
          <span class="label">{{ $t('mao.food') }}</span>
          <a-tag>{{
            `${resource.food} / ${resource.warehouseStore.food}`
          }}</a-tag>
        </a-menu-item>
        <a-menu-item>
          <span class="label">{{ $t('mao.wood') }}</span>
          <a-tag>{{
            `${resource.wood} / ${resource.warehouseStore.wood}`
          }}</a-tag>
        </a-menu-item>
        <a-menu-item>
          <span class="label">{{ $t('mao.stone') }}</span>
          <a-tag>{{
            `${resource.stone} / ${resource.warehouseStore.stone}`
          }}</a-tag>
        </a-menu-item>
        <a-menu-item>
          <span class="label">{{ $t('mao.gold') }}</span>
          <a-tag>{{
            `${resource.gold} / ${resource.warehouseStore.gold}`
          }}</a-tag>
        </a-menu-item>
      </a-menu>
    </div>
    <a-space class="opearte">
      <a-button size="small" type="dashed">{{ $t('mao.automation') }}</a-button>
      <a-button size="small" type="dashed">{{ $t('mao.priority') }}</a-button>
      <tech />
      <a-button size="small" type="dashed">{{ $t('com.save') }}</a-button>
    </a-space>
  </div>
</template>

<style lang="less" scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 2px;
  .status {
    width: 2px;
    flex: 1 1 auto;
    .ant-menu {
      border-bottom: none;
      :deep(.ant-menu-submenu-title) {
        padding-left: 0.2rem;
        padding-right: 0.2rem;
        line-height: normal;
        &::after {
          display: none;
        }
        .label::after {
          content: ':';
          padding-right: 0.2rem;
        }
      }
      :deep(.ant-menu-item) {
        padding-left: 0.2rem;
        padding-right: 0.2rem;
        line-height: normal;
        &::after {
          display: none;
        }
        .label::after {
          content: ':';
          padding-right: 0.2rem;
        }
      }
    }
  }
}
</style>
