<script setup>
import { computed } from 'vue'
import room from './content/room.vue'
import cropland from './content/cropland.vue'
import forest from './content/forest.vue'
import mine from './content/mine.vue'
import sawmill from './content/sawmill.vue'
import alchemy from './content/alchemy.vue'
import warehouse from './content/warehouse.vue'
import market from './content/market.vue'

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})

const className = computed(() => `content ${props.class}`)
</script>

<template>
  <div :class="className">
    <a-row :gutter="[8, 8]">
      <a-col :span="16" class="left">
        <a-row :gutter="[8, 8]">
          <room />
          <cropland />
          <forest />
          <sawmill />
          <mine />
          <alchemy />
          <market />
        </a-row>
      </a-col>
      <a-col :span="8" class="right">
        <a-row :gutter="[8, 8]">
          <!-- 人口 -->
          
          <!-- 仓库 -->
          <warehouse />
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<style lang="less" scoped>
.content {
  padding: 0 calc(0.2rem + 8px);
  .ant-row {
    height: 100%;
  }
  .left, .right {
    height: 100%;
    overflow: auto;
  }
}

</style>
